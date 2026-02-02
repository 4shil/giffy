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
  const [currentTime, setCurrentTime] = useState<number>(0);

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
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      if (time >= trimEnd) {
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

  const handleBack = () => {
    if (confirm('Go back? Your trim settings will be lost.')) {
      onBack();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4 sm:p-6">
      <div className="w-full max-w-3xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-block bg-lime-500 px-4 py-2 border-4 border-black neo-shadow-sm">
            <h1 className="text-3xl sm:text-4xl font-black uppercase">
              CHOOSE CLIP
            </h1>
          </div>
          <p className="text-sm text-gray-600 mt-2 font-semibold">
            Select which part of your video to convert
          </p>
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

        {/* Visual Timeline */}
        {!isLoading && (
          <div className="relative w-full h-12 bg-gray-200 border-4 border-black">
            {/* Selected region */}
            <div 
              className="absolute h-full bg-lime-500 opacity-50 transition-all"
              style={{
                left: `${(trimStart / duration) * 100}%`,
                width: `${((trimEnd - trimStart) / duration) * 100}%`
              }}
            />
            {/* Start marker */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-black"
              style={{ left: `${(trimStart / duration) * 100}%` }}
            />
            {/* End marker */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-black"
              style={{ left: `${(trimEnd / duration) * 100}%` }}
            />
            {/* Current time indicator */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-red-600 z-10"
              style={{ left: `${(currentTime / duration) * 100}%` }}
            />
          </div>
        )}

        {/* Trim Controls */}
        <div className="space-y-5 bg-white border-4 border-black p-4 sm:p-6 neo-shadow">
          {/* Start */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="trim-start" className="text-base sm:text-lg font-bold">
                START
              </label>
              <span className="text-lg sm:text-xl font-mono font-black bg-lime-500 px-3 py-1 border-2 border-black">
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
              aria-label={`Start time: ${formatTime(trimStart)}`}
            />
          </div>

          {/* End */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="trim-end" className="text-base sm:text-lg font-bold">
                END
              </label>
              <span className="text-lg sm:text-xl font-mono font-black bg-lime-500 px-3 py-1 border-2 border-black">
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
              aria-label={`End time: ${formatTime(trimEnd)}`}
            />
          </div>

          {/* Duration Info */}
          <div className={`text-center p-4 border-4 ${exceedsLimit ? 'border-red-600 bg-red-50' : 'border-black bg-lime-50'}`}>
            <p className="text-xs sm:text-sm font-bold text-gray-700 uppercase">Clip Duration</p>
            <p className="text-3xl sm:text-4xl font-black font-mono mt-1">
              {formatTime(clipDuration)}
            </p>
            {exceedsLimit && (
              <p className="text-base sm:text-lg font-black text-red-600 mt-2 uppercase">
                ⚠️ Max {maxDuration}s allowed
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={handleBack}
            className="flex-1 bg-white text-black font-black px-6 py-4 border-4 border-black neo-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-lg sm:text-xl uppercase"
          >
            ← BACK
          </button>
          
          <button
            onClick={() => onConfirm(trimStart, trimEnd)}
            disabled={exceedsLimit}
            className={`
              flex-1 font-black px-6 py-4 border-4 border-black neo-shadow transition-all text-lg sm:text-xl uppercase
              ${exceedsLimit 
                ? 'bg-gray-400 cursor-not-allowed opacity-60' 
                : 'bg-lime-500 hover:translate-x-1 hover:translate-y-1 hover:shadow-none'
              }
            `}
          >
            {exceedsLimit ? '⚠️ TOO LONG' : 'CONVERT →'}
          </button>
        </div>
      </div>
    </div>
  );
}
