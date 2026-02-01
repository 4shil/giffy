/* eslint-disable @typescript-eslint/no-explicit-any */
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

interface ConversionParams {
  videoBlob: Blob;
  trimStart: number;
  trimEnd: number;
  width: number;
  fps: number;
}

interface ProgressMessage {
  type: 'progress';
  progress: number;
}

interface CompleteMessage {
  type: 'complete';
  gifBlob: Blob;
}

interface ErrorMessage {
  type: 'error';
  error: string;
}

type WorkerMessage = ProgressMessage | CompleteMessage | ErrorMessage;

async function initFFmpeg() {
  if (ffmpeg) return ffmpeg;

  ffmpeg = new FFmpeg();

  ffmpeg.on('log', ({ message }) => {
    console.log('[FFmpeg Worker]', message);
  });

  ffmpeg.on('progress', ({ progress }) => {
    self.postMessage({
      type: 'progress',
      progress: Math.round(progress * 100),
    } as ProgressMessage);
  });

  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';

  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });

  return ffmpeg;
}

async function convertToGif(params: ConversionParams): Promise<Blob> {
  const ffmpegInstance = await initFFmpeg();
  
  const { videoBlob, trimStart, trimEnd, width, fps } = params;
  const duration = trimEnd - trimStart;

  // Write input video to FFmpeg virtual FS
  await ffmpegInstance.writeFile('input.mp4', await fetchFile(videoBlob));

  // Two-pass GIF generation for better quality
  // Pass 1: Generate palette
  await ffmpegInstance.exec([
    '-ss', trimStart.toString(),
    '-t', duration.toString(),
    '-i', 'input.mp4',
    '-vf', `fps=${fps},scale=${width}:-1:flags=lanczos,palettegen`,
    '-y',
    'palette.png',
  ]);

  // Pass 2: Use palette to generate GIF
  await ffmpegInstance.exec([
    '-ss', trimStart.toString(),
    '-t', duration.toString(),
    '-i', 'input.mp4',
    '-i', 'palette.png',
    '-filter_complex', `fps=${fps},scale=${width}:-1:flags=lanczos[x];[x][1:v]paletteuse`,
    '-y',
    'output.gif',
  ]);

  // Read output GIF
  const data = await ffmpegInstance.readFile('output.gif');
  
  // Clean up virtual FS
  await ffmpegInstance.deleteFile('input.mp4');
  await ffmpegInstance.deleteFile('palette.png');
  await ffmpegInstance.deleteFile('output.gif');

  return new Blob([data], { type: 'image/gif' });
}

self.onmessage = async (e: MessageEvent<ConversionParams>) => {
  try {
    const gifBlob = await convertToGif(e.data);
    
    self.postMessage({
      type: 'complete',
      gifBlob,
    } as CompleteMessage);
  } catch (error: any) {
    self.postMessage({
      type: 'error',
      error: error.message || 'Conversion failed',
    } as ErrorMessage);
  }
};
