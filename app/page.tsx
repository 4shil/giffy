'use client';

import { useState, useRef, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

type EditorState = 'loading' | 'empty' | 'editing' | 'processing' | 'complete';

export default function VideoEditor() {
  // State
  const [state, setState] = useState<EditorState>('loading');
  const [loadProgress, setLoadProgress] = useState(0);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [gifBlob, setGifBlob] = useState<Blob | null>(null);
  const [gifUrl, setGifUrl] = useState<string>('');

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load FFmpeg
  useEffect(() => {
    loadFFmpeg();
  }, []);

  const loadFFmpeg = async () => {
    try {
      const ffmpeg = new FFmpeg();
      ffmpegRef.current = ffmpeg;

      ffmpeg.on('log', ({ message }) => {
        console.log(message);
      });

      ffmpeg.on('progress', ({ progress: prog }) => {
        setProgress(Math.round(prog * 100));
      });

      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      setLoadProgress(100);
      setTimeout(() => setState('empty'), 500);
    } catch (error) {
      console.error('FFmpeg load error:', error);
      alert('Failed to load video processor. Please refresh.');
    }
  };

  // File selection
  const handleFileSelect = (file: File) => {
    if (!file) return;
    
    if (file.size > 100 * 1024 * 1024) {
      alert('File too large! Max 100 MB');
      return;
    }

    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoUrl(url);
    setState('editing');
    setTrimStart(0);
    setCurrentTime(0);
  };

  // Video loaded
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setDuration(dur);
      setTrimEnd(Math.min(dur, 60));
    }
  };

  // Time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // Play/pause
  const togglePlayPause = () => {
    if (!videoRef.current) return;
    
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Seek
  const seekTo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Convert to GIF
  const handleConvert = async () => {
    if (!videoFile || !ffmpegRef.current) return;

    setState('processing');
    setProgress(0);

    try {
      const ffmpeg = ffmpegRef.current;
      
      // Write input file
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));

      // Convert
      const clipDuration = trimEnd - trimStart;
      const fps = clipDuration <= 5 ? 20 : clipDuration <= 15 ? 15 : 12;
      const width = 480;

      await ffmpeg.exec([
        '-ss', trimStart.toString(),
        '-t', (clipDuration).toString(),
        '-i', 'input.mp4',
        '-vf', `fps=${fps},scale=${width}:-1:flags=lanczos`,
        '-loop', '0',
        'output.gif'
      ]);

      // Read output
      const data = await ffmpeg.readFile('output.gif') as Uint8Array;
      const blob = new Blob([new Uint8Array(data)], { type: 'image/gif' });
      const url = URL.createObjectURL(blob);
      
      setGifBlob(blob);
      setGifUrl(url);
      setState('complete');

      // Cleanup
      await ffmpeg.deleteFile('input.mp4');
      await ffmpeg.deleteFile('output.gif');
    } catch (error) {
      console.error('Conversion error:', error);
      alert('Conversion failed!');
      setState('editing');
    }
  };

  // Download
  const handleDownload = () => {
    if (!gifUrl) return;
    const a = document.createElement('a');
    a.href = gifUrl;
    a.download = `giffy-${Date.now()}.gif`;
    a.click();
  };

  // New project
  const handleNew = () => {
    if (confirm('Start new? Current work will be lost.')) {
      setVideoFile(null);
      setVideoUrl('');
      setGifBlob(null);
      setGifUrl('');
      setState('empty');
      setTrimStart(0);
      setTrimEnd(0);
      setCurrentTime(0);
    }
  };

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const clipDuration = trimEnd - trimStart;
  const canExport = clipDuration > 0 && clipDuration <= 60;

  // Loading screen
  if (state === 'loading') {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-brutalism-accent">
        <div className="text-center space-y-6 panel-brutal p-8">
          <div className="text-6xl">🎬</div>
          <h1 className="text-3xl font-bold uppercase">Giffy</h1>
          <div className="w-64 h-4 bg-white border-2 border-black">
            <div 
              className="h-full bg-brutalism-dark transition-all"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
          <p className="font-bold">Loading {loadProgress}%</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (state === 'empty') {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-brutalism-bg">
        <div className="text-center space-y-8 p-8">
          <div className="panel-brutal p-12">
            <div className="text-8xl mb-6">📹</div>
            <h1 className="text-4xl font-black uppercase mb-4">Giffy</h1>
            <p className="text-lg mb-8">Professional Video to GIF Editor</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-brutal-primary text-lg px-8 py-4"
            >
              Import Video
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
            className="hidden"
          />
        </div>
      </div>
    );
  }

  // Main editor
  return (
    <div className="h-screen w-screen flex flex-col bg-brutalism-bg overflow-hidden safe-area">
      {/* Top Toolbar */}
      <div className="h-14 border-b-2 border-black bg-brutalism-panel flex items-center justify-between px-4 flex-shrink-0 no-select">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-black uppercase">Giffy</h1>
          <button onClick={handleNew} className="btn-brutal text-sm">
            New
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          {state === 'editing' && (
            <button
              onClick={handleConvert}
              disabled={!canExport}
              className={canExport ? 'btn-brutal-success' : 'btn-brutal opacity-50 cursor-not-allowed'}
            >
              Export GIF
            </button>
          )}
          {state === 'complete' && (
            <button onClick={handleDownload} className="btn-brutal-primary">
              Download
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 border-r-2 border-black bg-brutalism-panel flex-shrink-0 overflow-y-auto">
          <div className="p-4 space-y-4">
            <div>
              <h2 className="text-sm font-black uppercase mb-2">Project</h2>
              {videoFile && (
                <div className="panel-brutal p-3 text-sm">
                  <p className="font-bold truncate">{videoFile.name}</p>
                  <p className="text-xs mt-1">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              )}
            </div>

            {state === 'editing' && (
              <div>
                <h2 className="text-sm font-black uppercase mb-2">Clip Info</h2>
                <div className="panel-brutal p-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-bold">{formatTime(clipDuration)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Start:</span>
                    <span className="font-mono">{formatTime(trimStart)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>End:</span>
                    <span className="font-mono">{formatTime(trimEnd)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Preview */}
        <div className="flex-1 flex flex-col">
          {/* Preview Area */}
          <div className="flex-1 flex items-center justify-center p-8 bg-brutalism-hover">
            {state === 'editing' && videoUrl && (
              <div className="w-full max-w-3xl">
                <div className="video-preview-brutal">
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full h-auto"
                    onLoadedMetadata={handleLoadedMetadata}
                    onTimeUpdate={handleTimeUpdate}
                    onClick={togglePlayPause}
                    playsInline
                  />
                </div>
                <div className="mt-4 flex justify-center gap-3">
                  <button onClick={togglePlayPause} className="icon-btn-brutal">
                    {isPlaying ? '⏸' : '▶'}
                  </button>
                  <button onClick={() => seekTo(trimStart)} className="icon-btn-brutal">
                    ⏮
                  </button>
                  <button onClick={() => seekTo(trimEnd)} className="icon-btn-brutal">
                    ⏭
                  </button>
                </div>
              </div>
            )}

            {state === 'processing' && (
              <div className="panel-brutal p-12 text-center">
                <div className="text-6xl mb-6 spin-brutal inline-block">⚡</div>
                <h2 className="text-2xl font-black uppercase mb-4">Processing</h2>
                <div className="w-64 h-4 bg-white border-2 border-black mx-auto">
                  <div 
                    className="h-full bg-brutalism-success transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-4 font-bold text-xl">{progress}%</p>
              </div>
            )}

            {state === 'complete' && gifUrl && (
              <div className="panel-brutal p-8">
                <h2 className="text-2xl font-black uppercase mb-6 text-center">Complete!</h2>
                <img src={gifUrl} alt="Generated GIF" className="border-4 border-black" />
                {gifBlob && (
                  <p className="text-center mt-4 font-bold">
                    {(gifBlob.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Timeline */}
          {state === 'editing' && (
            <div className="h-48 border-t-2 border-black bg-brutalism-panel flex-shrink-0">
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase">Timeline</span>
                  <span className="font-mono text-sm">{formatTime(currentTime)} / {formatTime(duration)}</span>
                </div>

                {/* Playhead */}
                <div>
                  <label className="text-xs font-bold mb-1 block">PLAYHEAD</label>
                  <input
                    type="range"
                    className="range-brutal"
                    min={0}
                    max={duration}
                    step={0.01}
                    value={currentTime}
                    onChange={(e) => seekTo(parseFloat(e.target.value))}
                  />
                </div>

                {/* Trim Start */}
                <div>
                  <label className="text-xs font-bold mb-1 block">TRIM START: {formatTime(trimStart)}</label>
                  <input
                    type="range"
                    className="range-brutal"
                    min={0}
                    max={duration}
                    step={0.1}
                    value={trimStart}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (val < trimEnd) setTrimStart(val);
                    }}
                  />
                </div>

                {/* Trim End */}
                <div>
                  <label className="text-xs font-bold mb-1 block">TRIM END: {formatTime(trimEnd)}</label>
                  <input
                    type="range"
                    className="range-brutal"
                    min={0}
                    max={duration}
                    step={0.1}
                    value={trimEnd}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (val > trimStart) setTrimEnd(val);
                    }}
                  />
                </div>

                {/* Status */}
                {!canExport && (
                  <div className="panel-brutal p-2 text-center bg-brutalism-danger text-white">
                    <p className="text-sm font-bold">Max 60s allowed!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-64 border-l-2 border-black bg-brutalism-panel flex-shrink-0 overflow-y-auto">
          <div className="p-4 space-y-4">
            <div>
              <h2 className="text-sm font-black uppercase mb-2">Export</h2>
              {state === 'editing' && (
                <div className="panel-brutal p-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Format:</span>
                    <span className="font-bold">GIF</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quality:</span>
                    <span className="font-bold">Optimized</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={`font-bold ${canExport ? 'text-brutalism-success' : 'text-brutalism-danger'}`}>
                      {canExport ? 'Ready' : 'Error'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
