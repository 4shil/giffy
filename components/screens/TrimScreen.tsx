'use client';

import { useEffect, useRef, useState } from 'react';

interface TrimScreenProps {
  file: File;
  onConfirm: (trimStart: number, trimEnd: number) => void;
  onBack: () => void;
  maxDuration: number;
}

export default function TrimScreen({ file, onConfirm, onBack, maxDuration }: TrimScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [duration, setDuration] = useState<number>(0);
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setVideoUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const videoDuration = videoRef.current.duration;
      setDuration(videoDuration);
      setTrimEnd(Math.min(videoDuration, maxDuration));
      setIsLoading(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      if (currentTime >= trimEnd) {
        videoRef.current.currentTime = trimStart;
      }
    }
  };

  useEffect(() => {
    if (videoRef.current && !isLoading) {
      videoRef.current.currentTime = trimStart;
    }
  }, [trimStart, isLoading]);

  const clipDuration = trimEnd - trimStart;
  const exceedsLimit = clipDuration > maxDuration;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-3xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-block bg-lime-500 px-4 py-2 border-4 border-black neo-shadow-sm">
            <h1 className="text-4xl sm:text-5xl font-black uppercase">
              TRIM VIDEO
            </h1>
          </div>
        </div>

        {/* Video Preview */}
        <div className="bg-black border-4 border-black neo-shadow-lg overflow-hidden">
          {isLoading && (
            <div className="aspect-video flex items-center justify-center bg-gray-900">
              <div className="text-white text-4xl animate-spin">⏳</div>
            </div>
          )}
          
          <video
            ref={videoRef}
            src={videoUrl}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            controls
            loop
            className="w-full"
            aria-label="Video preview"
          />
        </div>

        {/* Trim Controls */}
        <div className="space-y-6 bg-white border-4 border-black p-6 neo-shadow">
          {/* Start */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label htmlFor="trim-start" className="text-xl font-black uppercase">
                START
              </label>
              <span className="text-2xl font-mono font-black bg-lime-500 px-3 py-1 border-2 border-black">
                {formatTime(trimStart)}
              </span>
            </div>
            <input
              id="trim-start"
              type="range"
              min={0}
              max={duration}
              step={0.1}
              value={trimStart}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (value < trimEnd) {
                  setTrimStart(value);
                }
              }}
              className="w-full h-4 bg-gray-300 border-2 border-black appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #84cc16 0%, #84cc16 ${(trimStart / duration) * 100}%, #d1d5db ${(trimStart / duration) * 100}%, #d1d5db 100%)`
              }}
            />
          </div>

          {/* End */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label htmlFor="trim-end" className="text-xl font-black uppercase">
                END
              </label>
              <span className="text-2xl font-mono font-black bg-lime-500 px-3 py-1 border-2 border-black">
                {formatTime(trimEnd)}
              </span>
            </div>
            <input
              id="trim-end"
              type="range"
              min={0}
              max={duration}
              step={0.1}
              value={trimEnd}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (value > trimStart) {
                  setTrimEnd(value);
                }
              }}
              className="w-full h-4 bg-gray-300 border-2 border-black appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #84cc16 0%, #84cc16 ${(trimEnd / duration) * 100}%, #d1d5db ${(trimEnd / duration) * 100}%, #d1d5db 100%)`
              }}
            />
          </div>

          {/* Duration Info */}
          <div className={`text-center p-4 border-4 ${exceedsLimit ? 'border-red-600 bg-red-50' : 'border-black bg-lime-50'}`}>
            <p className="text-sm font-bold text-gray-700">CLIP DURATION</p>
            <p className="text-4xl font-black font-mono mt-1">
              {formatTime(clipDuration)}
            </p>
            {exceedsLimit && (
              <p className="text-lg font-black text-red-600 mt-2 uppercase">
                ⚠ MAX {maxDuration}S ALLOWED
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={onBack}
            className="flex-1 bg-white text-black font-black px-6 py-4 border-4 border-black neo-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-xl uppercase"
          >
            ← BACK
          </button>
          
          <button
            onClick={() => onConfirm(trimStart, trimEnd)}
            disabled={exceedsLimit}
            className={`
              flex-1 font-black px-6 py-4 border-4 border-black neo-shadow transition-all text-xl uppercase
              ${exceedsLimit 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-lime-500 hover:translate-x-1 hover:translate-y-1 hover:shadow-none'
              }
            `}
          >
            OK →
          </button>
        </div>
      </div>
    </div>
  );
}
