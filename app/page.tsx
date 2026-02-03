'use client';

import { useState, useRef, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

type AppState = 'init' | 'empty' | 'loaded' | 'editing' | 'processing' | 'ready';

export default function Giffy() {
  const [state, setState] = useState<AppState>('init');
  const [loadProgress, setLoadProgress] = useState(0);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [gifBlob, setGifBlob] = useState<Blob | null>(null);
  const [gifUrl, setGifUrl] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => { initFFmpeg(); }, []);
  
  const initFFmpeg = async () => {
    try {
      const ffmpeg = new FFmpeg();
      ffmpegRef.current = ffmpeg;
      
      ffmpeg.on('progress', ({ progress }) => {
        setConversionProgress(Math.round(progress * 100));
      });
      
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      const progressInterval = setInterval(() => {
        setLoadProgress(prev => prev >= 95 ? prev : prev + 5);
      }, 200);
      
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      
      clearInterval(progressInterval);
      setLoadProgress(100);
      setTimeout(() => setState('empty'), 300);
    } catch (error) {
      console.error('FFmpeg init failed:', error);
      alert('Failed to initialize. Please refresh.');
    }
  };
  
  const handleFileSelect = (file: File) => {
    if (!file?.type.startsWith('video/')) return alert('Please select a video file');
    if (file.size > 100 * 1024 * 1024) return alert('File must be under 100 MB');
    
    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoUrl(url);
    setState('loaded');
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dropZoneRef.current?.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    dropZoneRef.current?.classList.add('drag-over');
  };
  
  const handleDragLeave = () => {
    dropZoneRef.current?.classList.remove('drag-over');
  };
  
  const handleVideoLoad = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setDuration(dur);
      setTrimEnd(Math.min(dur, 10));
      setState('editing');
    }
  };
  
  const handleTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  };
  
  const togglePlay = () => {
    if (!videoRef.current) return;
    isPlaying ? videoRef.current.pause() : videoRef.current.play();
    setIsPlaying(!isPlaying);
  };
  
  const seekTo = (time: number) => {
    if (videoRef.current) videoRef.current.currentTime = time;
  };
  
  const handleExport = async () => {
    if (!videoFile || !ffmpegRef.current) return;
    
    setState('processing');
    setConversionProgress(0);
    
    try {
      const ffmpeg = ffmpegRef.current;
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));
      
      const clipDuration = trimEnd - trimStart;
      const fps = clipDuration <= 3 ? 24 : clipDuration <= 10 ? 15 : 12;
      
      await ffmpeg.exec([
        '-ss', trimStart.toString(),
        '-t', clipDuration.toString(),
        '-i', 'input.mp4',
        '-vf', `fps=${fps},scale=600:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=256[p];[s1][p]paletteuse=dither=bayer`,
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
      alert('Conversion failed. Try again.');
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
  
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
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
  
  // INIT State
  if (state === 'init') {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FF2E63 0%, #08D9D6 50%, #FFD93D 100%)' }}>
        <div className="card card-glow-pink animate-popin" style={{ maxWidth: '450px', width: '90%' }}>
          <div className="icon-box mx-auto mb-6 animate-bounce">
            <svg className="w-12 h-12 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h1 className="text-h1 text-center mb-4 text-gradient">GIFFY</h1>
          <p className="text-center mb-6" style={{ fontWeight: 600 }}>LOADING VIDEO PROCESSOR...</p>
          <div className="progress mb-4">
            <div className="progress-fill" style={{ width: `${loadProgress}%` }}></div>
          </div>
          <p className="text-center text-bold text-h2">{loadProgress}%</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      {/* Fixed Header */}
      <header className="header flex-shrink-0" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="container flex items-center justify-between" style={{ padding: 'var(--space-base)' }}>
          <div className="flex items-center gap-base">
            <div className="icon-box" style={{ width: '48px', height: '48px' }}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            </div>
            <h1 className="text-h2 text-gradient" style={{ fontWeight: 800 }}>GIFFY</h1>
          </div>
          
          {state !== 'empty' && (
            <button onClick={handleReset} className="btn-accent" style={{ padding: '10px 20px', fontSize: '14px' }}>
              ✨ NEW
            </button>
          )}
        </div>
      </header>
      
      {/* Scrollable Main Content */}
      <main className="flex-1 overflow-y-auto" style={{ padding: 'var(--space-lg) 0' }}>
        <div className="container h-full">
          {/* EMPTY State */}
          {state === 'empty' && (
            <div className="h-full flex items-center justify-center">
              <div className="animate-popin" style={{ maxWidth: '700px', width: '100%' }}>
                <div className="text-center mb-8">
                  <h2 className="text-display text-gradient mb-4" style={{ lineHeight: 0.9, fontSize: 'clamp(40px, 8vw, 64px)' }}>
                    CREATE<br/>AMAZING<br/>GIFs
                  </h2>
                  <p className="text-h3 text-bold" style={{ color: 'var(--color-text-secondary)' }}>
                    FAST • SIMPLE • FREE
                  </p>
                </div>
                
                <div
                  ref={dropZoneRef}
                  className="drop-zone mb-8"
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  style={{ padding: 'var(--space-2xl) var(--space-lg)' }}
                >
                  <div className="icon-box icon-box-accent mx-auto mb-4 animate-bounce" style={{ width: '80px', height: '80px' }}>
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-border)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <h3 className="text-h2 text-bold mb-3">DROP VIDEO HERE</h3>
                  <p className="text-body mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                    OR CLICK TO BROWSE
                  </p>
                  <button className="btn-primary btn-lg">
                    📁 CHOOSE VIDEO
                  </button>
                  <p style={{ marginTop: 'var(--space-base)', fontSize: 'var(--font-small)', fontWeight: 600, color: 'var(--color-text-tertiary)' }}>
                    MP4, MOV, WEBM • MAX 100 MB
                  </p>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                  style={{ display: 'none' }}
                />
                
                <div className="grid gap-base" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                  <div className="feature-card" style={{ padding: 'var(--space-base)' }}>
                    <div style={{ fontSize: '32px', marginBottom: 'var(--space-sm)' }}>⚡</div>
                    <h4 className="text-body text-bold mb-1">LIGHTNING FAST</h4>
                    <p style={{ fontSize: 'var(--font-small)', color: 'var(--color-text-secondary)' }}>
                      Browser-based
                    </p>
                  </div>
                  <div className="feature-card" style={{ padding: 'var(--space-base)' }}>
                    <div style={{ fontSize: '32px', marginBottom: 'var(--space-sm)' }}>🔒</div>
                    <h4 className="text-body text-bold mb-1">100% PRIVATE</h4>
                    <p style={{ fontSize: 'var(--font-small)', color: 'var(--color-text-secondary)' }}>
                      Never uploaded
                    </p>
                  </div>
                  <div className="feature-card" style={{ padding: 'var(--space-base)' }}>
                    <div style={{ fontSize: '32px', marginBottom: 'var(--space-sm)' }}>🎨</div>
                    <h4 className="text-body text-bold mb-1">PRO QUALITY</h4>
                    <p style={{ fontSize: 'var(--font-small)', color: 'var(--color-text-secondary)' }}>
                      Optimized output
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* LOADED/EDITING State */}
          {(state === 'loaded' || state === 'editing') && videoUrl && (
            <div className="h-full flex items-center justify-center">
              <div className="animate-popin w-full" style={{ maxWidth: '900px' }}>
                <div className="card card-glow-cyan" style={{ padding: 'var(--space-lg)' }}>
                  {/* Video Container - Fixed aspect ratio */}
                  <div className="video-container mb-4" style={{ maxHeight: '50vh' }}>
                    <video
                      ref={videoRef}
                      src={videoUrl}
                      onLoadedMetadata={handleVideoLoad}
                      onTimeUpdate={handleTimeUpdate}
                      onClick={togglePlay}
                      playsInline
                      style={{ cursor: 'pointer', maxHeight: '50vh', width: '100%', objectFit: 'contain' }}
                    />
                  </div>
                  
                  {state === 'editing' && (
                    <>
                      {/* Single Row Controls */}
                      <div className="flex items-center justify-center gap-base mb-4">
                        <button onClick={() => seekTo(trimStart)} className="btn-secondary" style={{ padding: '12px 16px', fontSize: '14px' }}>
                          ⏮ START
                        </button>
                        <button onClick={togglePlay} className="btn-primary" style={{ width: '56px', height: '56px', padding: 0, borderRadius: '12px' }}>
                          {isPlaying ? (
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 9v6m4-6v6" />
                            </svg>
                          ) : (
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            </svg>
                          )}
                        </button>
                        <button onClick={() => seekTo(trimEnd)} className="btn-secondary" style={{ padding: '12px 16px', fontSize: '14px' }}>
                          END ⏭
                        </button>
                      </div>
                      
                      <div className="divider" style={{ margin: 'var(--space-base) 0' }}></div>
                      
                      {/* Compact Timeline */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-body text-bold">TIMELINE</span>
                          <span className="badge" style={{ padding: '4px 10px', fontSize: '12px' }}>{formatTime(currentTime)} / {formatTime(duration)}</span>
                        </div>
                        
                        <div className="mb-3">
                          <label className="text-bold" style={{ fontSize: '11px', display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>
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
                        
                        <div className="grid grid-cols-2 gap-base mb-4">
                          <div>
                            <label className="text-bold" style={{ fontSize: '11px', display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>
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
                          <div>
                            <label className="text-bold" style={{ fontSize: '11px', display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>
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
                        
                        <div className="flex items-center justify-between">
                          <span className="text-body text-bold">DURATION: {formatTime(clipDuration)}</span>
                          {!canExport && (
                            <div className="badge-error" style={{ padding: '6px 12px', fontSize: '12px' }}>⚠️ MAX 60 SEC</div>
                          )}
                          {canExport && (
                            <button onClick={handleExport} className="btn-primary" style={{ padding: '12px 24px', fontSize: '14px' }}>
                              ⚡ EXPORT GIF
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* PROCESSING State */}
          {state === 'processing' && (
            <div className="h-full flex items-center justify-center">
              <div className="animate-popin" style={{ maxWidth: '500px', width: '90%' }}>
                <div className="card card-glow-pink text-center" style={{ padding: 'var(--space-xl)' }}>
                  <div className="icon-box mx-auto mb-6 animate-wiggle">
                    <svg className="w-12 h-12 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <h2 className="text-h1 text-bold mb-3">CREATING YOUR GIF</h2>
                  <p className="text-body mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                    USUALLY TAKES 3-8 SECONDS
                  </p>
                  <div className="progress mb-4">
                    <div className="progress-fill" style={{ width: `${conversionProgress}%` }}></div>
                  </div>
                  <p className="text-display text-bold">{conversionProgress}%</p>
                </div>
              </div>
            </div>
          )}
          
          {/* READY State */}
          {state === 'ready' && gifUrl && (
            <div className="h-full flex items-center justify-center">
              <div className="animate-popin w-full" style={{ maxWidth: '800px' }}>
                <div className="card card-glow-pink" style={{ padding: 'var(--space-lg)' }}>
                  <div className="text-center mb-6">
                    <div className="badge-success" style={{ display: 'inline-flex', marginBottom: 'var(--space-base)', padding: '6px 12px', fontSize: '12px' }}>
                      ✓ READY TO DOWNLOAD
                    </div>
                    <h2 className="text-h1 text-gradient">YOUR GIF IS READY!</h2>
                  </div>
                  
                  <div className="video-container mb-6" style={{ maxHeight: '50vh' }}>
                    <img src={gifUrl} alt="Generated GIF" style={{ maxHeight: '50vh', width: '100%', objectFit: 'contain' }} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-base mb-6">
                    <div className="stat-box" style={{ padding: 'var(--space-base)' }}>
                      <p className="text-bold mb-1" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>FILE SIZE</p>
                      <p className="text-h2 text-bold">{gifBlob && formatBytes(gifBlob.size)}</p>
                    </div>
                    <div className="stat-box" style={{ background: 'linear-gradient(135deg, var(--color-secondary), var(--color-secondary-light))', padding: 'var(--space-base)' }}>
                      <p className="text-bold mb-1" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>DURATION</p>
                      <p className="text-h2 text-bold">{formatTime(clipDuration)}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-base">
                    <button onClick={handleDownload} className="btn-primary" style={{ padding: '14px 20px', fontSize: '14px' }}>
                      ⬇️ DOWNLOAD
                    </button>
                    <button onClick={handleReset} className="btn-secondary" style={{ padding: '14px 20px', fontSize: '14px' }}>
                      ✨ NEW GIF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
