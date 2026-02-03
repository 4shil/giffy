'use client';

import { useState, useRef, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

type AppState = 'init' | 'empty' | 'loaded' | 'editing' | 'processing' | 'ready';

export default function Giffy() {
  // Core state
  const [state, setState] = useState<AppState>('init');
  const [loadProgress, setLoadProgress] = useState(0);
  
  // Video state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Trim state
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  
  // Processing state
  const [conversionProgress, setConversionProgress] = useState(0);
  
  // Output state
  const [gifBlob, setGifBlob] = useState<Blob | null>(null);
  const [gifUrl, setGifUrl] = useState('');
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  
  // Initialize FFmpeg
  useEffect(() => {
    initFFmpeg();
  }, []);
  
  const initFFmpeg = async () => {
    try {
      const ffmpeg = new FFmpeg();
      ffmpegRef.current = ffmpeg;
      
      ffmpeg.on('progress', ({ progress }) => {
        setConversionProgress(Math.round(progress * 100));
      });
      
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      
      // Simulate loading progress
      const progressInterval = setInterval(() => {
        setLoadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 200);
      
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      
      clearInterval(progressInterval);
      setLoadProgress(100);
      
      setTimeout(() => setState('empty'), 300);
    } catch (error) {
      console.error('FFmpeg initialization failed:', error);
      alert('Failed to initialize. Please refresh the page.');
    }
  };
  
  // File handling
  const handleFileSelect = (file: File) => {
    if (!file || !file.type.startsWith('video/')) {
      alert('Please select a video file');
      return;
    }
    
    if (file.size > 100 * 1024 * 1024) {
      alert('File must be under 100 MB');
      return;
    }
    
    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoUrl(url);
    setState('loaded');
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.add('drag-over');
    }
  };
  
  const handleDragLeave = () => {
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove('drag-over');
    }
  };
  
  // Video controls
  const handleVideoLoad = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setDuration(dur);
      setTrimEnd(Math.min(dur, 10)); // Default 10s max
      setState('editing');
    }
  };
  
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };
  
  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };
  
  const seekTo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };
  
  // GIF conversion
  const handleExport = async () => {
    if (!videoFile || !ffmpegRef.current) return;
    
    setState('processing');
    setConversionProgress(0);
    
    try {
      const ffmpeg = ffmpegRef.current;
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));
      
      const clipDuration = trimEnd - trimStart;
      const fps = clipDuration <= 3 ? 24 : clipDuration <= 10 ? 15 : 12;
      const width = 600;
      
      await ffmpeg.exec([
        '-ss', trimStart.toString(),
        '-t', clipDuration.toString(),
        '-i', 'input.mp4',
        '-vf', `fps=${fps},scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=256[p];[s1][p]paletteuse=dither=bayer`,
        '-loop', '0',
        'output.gif'
      ]);
      
      const data = await ffmpeg.readFile('output.gif') as Uint8Array;
      const blob = new Blob([new Uint8Array(data)], { type: 'image/gif' });
      const url = URL.createObjectURL(blob);
      
      setGifBlob(blob);
      setGifUrl(url);
      setState('ready');
      
      await ffmpeg.deleteFile('input.mp4');
      await ffmpeg.deleteFile('output.gif');
    } catch (error) {
      console.error('Conversion failed:', error);
      alert('Conversion failed. Please try again.');
      setState('editing');
    }
  };
  
  const handleDownload = () => {
    if (!gifUrl) return;
    
    const a = document.createElement('a');
    a.href = gifUrl;
    a.download = `giffy-${Date.now()}.gif`;
    a.click();
  };
  
  const handleReset = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    if (gifUrl) URL.revokeObjectURL(gifUrl);
    
    setVideoFile(null);
    setVideoUrl('');
    setGifBlob(null);
    setGifUrl('');
    setTrimStart(0);
    setTrimEnd(0);
    setCurrentTime(0);
    setState('empty');
  };
  
  // Utilities
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };
  
  const clipDuration = trimEnd - trimStart;
  const canExport = clipDuration > 0.5 && clipDuration <= 60;
  
  // Render: INIT State
  if (state === 'init') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)' }}>
        <div className="card card-elevated text-center" style={{ maxWidth: '400px', width: '90%' }}>
          <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4)' }}>
            <svg className="w-10 h-10 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h1 style={{ fontSize: 'var(--font-h1)', marginBottom: 'var(--space-sm)', color: 'var(--color-gray-900)' }}>
            Giffy
          </h1>
          <p style={{ color: 'var(--color-gray-600)', marginBottom: 'var(--space-lg)' }}>
            Loading video processor...
          </p>
          <div className="progress">
            <div className="progress-fill" style={{ width: `${loadProgress}%` }}></div>
          </div>
          <p style={{ marginTop: 'var(--space-md)', fontSize: 'var(--font-small)', fontWeight: 500 }}>
            {loadProgress}%
          </p>
        </div>
      </div>
    );
  }
  
  // Render: Main App
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FAFBFC' }}>
      {/* Header */}
      <header style={{ 
        background: 'white', 
        borderBottom: '1px solid var(--color-gray-100)',
        padding: 'var(--space-base) 0'
      }}>
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-base">
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            </div>
            <h1 style={{ fontSize: 'var(--font-h2)', fontWeight: 600, color: 'var(--color-gray-900)' }}>
              Giffy
            </h1>
          </div>
          
          {state !== 'empty' && (
            <button onClick={handleReset} className="btn-secondary">
              New GIF
            </button>
          )}
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1" style={{ padding: 'var(--space-xl) 0' }}>
        <div className="container">
          {/* EMPTY State */}
          {state === 'empty' && (
            <div className="animate-slideup" style={{ maxWidth: '800px', margin: '0 auto' }}>
              <div className="text-center" style={{ marginBottom: 'var(--space-2xl)' }}>
                <h2 style={{ fontSize: 'var(--font-display)', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 'var(--space-base)', lineHeight: 1.1 }}>
                  Create Amazing GIFs
                </h2>
                <p style={{ fontSize: 'var(--font-h3)', color: 'var(--color-gray-600)' }}>
                  Fast, simple, and completely free. No signup required.
                </p>
              </div>
              
              <div
                ref={dropZoneRef}
                className="drop-zone"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto var(--space-lg)'
                }}>
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 style={{ fontSize: 'var(--font-h2)', fontWeight: 600, color: 'var(--color-gray-900)', marginBottom: 'var(--space-sm)' }}>
                  Drop your video here
                </h3>
                <p style={{ color: 'var(--color-gray-600)', marginBottom: 'var(--space-lg)' }}>
                  or click to browse
                </p>
                <button className="btn-primary btn-lg">
                  Choose Video
                </button>
                <p style={{ marginTop: 'var(--space-lg)', fontSize: 'var(--font-small)', color: 'var(--color-gray-400)' }}>
                  Supports MP4, MOV, WebM • Max 100 MB
                </p>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                style={{ display: 'none' }}
              />
              
              {/* Features */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: 'var(--space-lg)',
                marginTop: 'var(--space-2xl)'
              }}>
                <div className="text-center">
                  <div style={{ fontSize: '32px', marginBottom: 'var(--space-sm)' }}>⚡</div>
                  <h4 style={{ fontWeight: 600, marginBottom: 'var(--space-xs)' }}>Super Fast</h4>
                  <p style={{ fontSize: 'var(--font-small)', color: 'var(--color-gray-600)' }}>
                    Processes in your browser
                  </p>
                </div>
                <div className="text-center">
                  <div style={{ fontSize: '32px', marginBottom: 'var(--space-sm)' }}>🔒</div>
                  <h4 style={{ fontWeight: 600, marginBottom: 'var(--space-xs)' }}>Private</h4>
                  <p style={{ fontSize: 'var(--font-small)', color: 'var(--color-gray-600)' }}>
                    Videos never leave your device
                  </p>
                </div>
                <div className="text-center">
                  <div style={{ fontSize: '32px', marginBottom: 'var(--space-sm)' }}>🎨</div>
                  <h4 style={{ fontWeight: 600, marginBottom: 'var(--space-xs)' }}>High Quality</h4>
                  <p style={{ fontSize: 'var(--font-small)', color: 'var(--color-gray-600)' }}>
                    Optimized output, every time
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* LOADED/EDITING State */}
          {(state === 'loaded' || state === 'editing') && videoUrl && (
            <div className="animate-slideup" style={{ maxWidth: '1000px', margin: '0 auto' }}>
              <div className="card card-elevated" style={{ marginBottom: 'var(--space-lg)' }}>
                <div className="video-container">
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    onLoadedMetadata={handleVideoLoad}
                    onTimeUpdate={handleTimeUpdate}
                    onClick={togglePlay}
                    playsInline
                    style={{ width: '100%', display: 'block', cursor: 'pointer' }}
                  />
                </div>
                
                {state === 'editing' && (
                  <>
                    {/* Controls */}
                    <div className="flex items-center justify-center gap-sm" style={{ marginTop: 'var(--space-lg)' }}>
                      <button onClick={() => seekTo(trimStart)} className="btn-icon btn-secondary">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                      </button>
                      <button onClick={togglePlay} className="btn-primary btn-icon" style={{ width: '56px', height: '56px' }}>
                        {isPlaying ? (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </button>
                      <button onClick={() => seekTo(trimEnd)} className="btn-icon btn-secondary">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Timeline */}
                    <div style={{ marginTop: 'var(--space-xl)' }}>
                      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-md)' }}>
                        <span style={{ fontSize: 'var(--font-small)', fontWeight: 500, color: 'var(--color-gray-900)' }}>
                          Timeline
                        </span>
                        <span style={{ fontSize: 'var(--font-small)', fontFamily: 'monospace', color: 'var(--color-gray-600)' }}>
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                      </div>
                      
                      <div style={{ marginBottom: 'var(--space-lg)' }}>
                        <label style={{ fontSize: 'var(--font-tiny)', fontWeight: 500, color: 'var(--color-gray-600)', display: 'block', marginBottom: 'var(--space-sm)' }}>
                          PLAYHEAD
                        </label>
                        <input
                          type="range"
                          min={0}
                          max={duration}
                          step={0.01}
                          value={currentTime}
                          onChange={(e) => seekTo(parseFloat(e.target.value))}
                        />
                      </div>
                      
                      <div className="flex gap-lg">
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: 'var(--font-tiny)', fontWeight: 500, color: 'var(--color-gray-600)', display: 'block', marginBottom: 'var(--space-sm)' }}>
                            START: {formatTime(trimStart)}
                          </label>
                          <input
                            type="range"
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
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: 'var(--font-tiny)', fontWeight: 500, color: 'var(--color-gray-600)', display: 'block', marginBottom: 'var(--space-sm)' }}>
                            END: {formatTime(trimEnd)}
                          </label>
                          <input
                            type="range"
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
                      </div>
                      
                      <div className="flex items-center justify-between" style={{ marginTop: 'var(--space-lg)' }}>
                        <div>
                          <span style={{ fontSize: 'var(--font-small)', color: 'var(--color-gray-600)' }}>
                            Duration: <strong>{formatTime(clipDuration)}</strong>
                          </span>
                        </div>
                        {!canExport && (
                          <div className="badge-error">
                            Max 60 seconds
                          </div>
                        )}
                        {canExport && (
                          <button onClick={handleExport} className="btn-primary">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Export GIF
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          
          {/* PROCESSING State */}
          {state === 'processing' && (
            <div className="animate-slideup" style={{ maxWidth: '500px', margin: '0 auto' }}>
              <div className="card card-elevated text-center">
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto var(--space-lg)'
                }}>
                  <svg className="w-10 h-10 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h2 style={{ fontSize: 'var(--font-h1)', fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
                  Creating your GIF
                </h2>
                <p style={{ color: 'var(--color-gray-600)', marginBottom: 'var(--space-xl)' }}>
                  This usually takes 3-8 seconds
                </p>
                <div className="progress">
                  <div className="progress-fill" style={{ width: `${conversionProgress}%` }}></div>
                </div>
                <p style={{ marginTop: 'var(--space-md)', fontSize: 'var(--font-h2)', fontWeight: 600 }}>
                  {conversionProgress}%
                </p>
              </div>
            </div>
          )}
          
          {/* READY State */}
          {state === 'ready' && gifUrl && (
            <div className="animate-slideup" style={{ maxWidth: '800px', margin: '0 auto' }}>
              <div className="card card-elevated">
                <div className="text-center" style={{ marginBottom: 'var(--space-xl)' }}>
                  <div className="badge-success" style={{ display: 'inline-flex', marginBottom: 'var(--space-base)' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Ready to download
                  </div>
                  <h2 style={{ fontSize: 'var(--font-h1)', fontWeight: 600 }}>
                    Your GIF is ready!
                  </h2>
                </div>
                
                <div style={{ 
                  borderRadius: '12px', 
                  overflow: 'hidden', 
                  border: '1px solid var(--color-gray-100)',
                  marginBottom: 'var(--space-xl)'
                }}>
                  <img src={gifUrl} alt="Generated GIF" style={{ width: '100%', display: 'block' }} />
                </div>
                
                <div className="flex gap-base" style={{ marginBottom: 'var(--space-xl)' }}>
                  <div className="card" style={{ flex: 1, textAlign: 'center' }}>
                    <p style={{ fontSize: 'var(--font-small)', color: 'var(--color-gray-600)', marginBottom: 'var(--space-xs)' }}>
                      File Size
                    </p>
                    <p style={{ fontSize: 'var(--font-h2)', fontWeight: 600 }}>
                      {gifBlob && formatBytes(gifBlob.size)}
                    </p>
                  </div>
                  <div className="card" style={{ flex: 1, textAlign: 'center' }}>
                    <p style={{ fontSize: 'var(--font-small)', color: 'var(--color-gray-600)', marginBottom: 'var(--space-xs)' }}>
                      Duration
                    </p>
                    <p style={{ fontSize: 'var(--font-h2)', fontWeight: 600 }}>
                      {formatTime(clipDuration)}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-base">
                  <button onClick={handleDownload} className="btn-primary" style={{ flex: 1 }}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download GIF
                  </button>
                  <button onClick={handleReset} className="btn-secondary" style={{ flex: 1 }}>
                    Create Another
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer style={{ 
        background: 'white', 
        borderTop: '1px solid var(--color-gray-100)',
        padding: 'var(--space-lg) 0',
        marginTop: 'auto'
      }}>
        <div className="container text-center">
          <p style={{ fontSize: 'var(--font-small)', color: 'var(--color-gray-600)' }}>
            Made with ❤️ • Privacy-first • No tracking • Open source
          </p>
        </div>
      </footer>
    </div>
  );
}
