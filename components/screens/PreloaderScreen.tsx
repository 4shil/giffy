'use client';

import { useEffect, useState } from 'react';
import { preloadFFmpeg } from '@/lib/ffmpeg-preload';

interface PreloaderScreenProps {
  onComplete: () => void;
}

export default function PreloaderScreen({ onComplete }: PreloaderScreenProps) {
  const [progress, setProgress] = useState(0);
  const [downloadedMB, setDownloadedMB] = useState(0);

  useEffect(() => {
    const totalMB = 31; // Approximate size of FFmpeg WASM

    preloadFFmpeg((prog) => {
      setProgress(prog);
      setDownloadedMB((prog / 100) * totalMB);
      
      if (prog === 100) {
        setTimeout(() => onComplete(), 800);
      }
    }).catch((err) => {
      console.error('FFmpeg preload error:', err);
    });
  }, [onComplete]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="text-center space-y-8 max-w-md w-full">
        {/* Logo */}
        <div className="space-y-4">
          <div className="w-32 h-32 mx-auto bg-lime-500 border-4 border-black neo-shadow-lg flex items-center justify-center">
            <span className="text-6xl">🎬</span>
          </div>
          
          <h1 className="text-6xl font-black uppercase tracking-tight">
            GIFFY
          </h1>
          
          <p className="text-xl font-bold text-gray-700">
            Video to GIF Converter
          </p>
          
          <p className="text-sm font-semibold text-gray-600">
            No uploads • No tracking • 100% Private
          </p>
        </div>

        {/* Progress */}
        <div className="space-y-4">
          <div className="w-full bg-white border-4 border-black h-8 overflow-hidden">
            <div 
              className="h-full bg-lime-500 transition-all duration-300 flex items-center justify-center"
              style={{ width: `${progress}%` }}
            >
              {progress > 10 && (
                <span className="text-sm font-black text-black">
                  {progress}%
                </span>
              )}
            </div>
          </div>
          
          <div className="flex justify-between text-sm font-bold">
            <span>Loading FFmpeg...</span>
            <span className="font-mono">{downloadedMB.toFixed(1)} / 31 MB</span>
          </div>
        </div>

        <p className="text-xs font-semibold text-gray-500">
          One-time download • Cached forever
        </p>
      </div>
    </div>
  );
}
