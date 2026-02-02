'use client';

import { useEffect, useState } from 'react';
import { preloadFFmpeg } from '@/lib/ffmpeg-preload';

interface PreloaderScreenProps {
  onComplete: () => void;
}

export default function PreloaderScreen({ onComplete }: PreloaderScreenProps) {
  const [progress, setProgress] = useState(0);
  const [downloadedMB, setDownloadedMB] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const totalMB = 31;

    preloadFFmpeg((prog) => {
      setProgress(prog);
      setDownloadedMB((prog / 100) * totalMB);
      
      if (prog === 100) {
        setTimeout(() => onComplete(), 500);
      }
    }).catch((err) => {
      console.error('FFmpeg preload error:', err);
      setError('Setup failed. Please refresh the page.');
    });
  }, [onComplete]);

  const estimatedSeconds = Math.max(3, Math.ceil((100 - progress) / 3));

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="text-6xl">⚠️</div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black uppercase">Setup Failed</h1>
            <p className="text-base text-gray-700">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-lime-500 text-black font-black px-6 py-3 border-4 border-black neo-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-lg uppercase"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="text-center space-y-6 max-w-md w-full">
        {/* Logo */}
        <div className="space-y-3">
          <div className="w-24 h-24 mx-auto bg-lime-500 border-4 border-black neo-shadow-lg flex items-center justify-center">
            <span className="text-5xl">🎬</span>
          </div>
          
          <h1 className="text-5xl font-black uppercase tracking-tight">
            GIFFY
          </h1>
          
          <p className="text-lg font-bold text-gray-700">
            Video to GIF Converter
          </p>
        </div>

        {/* Main message - no jargon */}
        <div className="space-y-2">
          <p className="text-xl font-bold text-black">
            Setting up converter...
          </p>
          <p className="text-sm text-gray-600">
            About {estimatedSeconds}s remaining
          </p>
        </div>

        {/* Progress */}
        <div className="space-y-3">
          <div 
            className="w-full bg-white border-4 border-black h-10 overflow-hidden"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Setup progress"
          >
            <div 
              className="h-full bg-lime-500 transition-all duration-300 flex items-center justify-center"
              style={{ width: `${progress}%` }}
            >
              {progress > 8 && (
                <span className="text-base font-black text-black">
                  {progress}%
                </span>
              )}
            </div>
          </div>
          
          <p className="text-xs text-gray-500 font-semibold">
            {downloadedMB.toFixed(1)} / 31 MB • One-time setup • Saves to your browser
          </p>
        </div>
      </div>
    </div>
  );
}
