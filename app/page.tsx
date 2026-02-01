'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import VideoPreview from '@/components/VideoPreview';
import TrimSlider from '@/components/TrimSlider';

const MAX_DURATION_DESKTOP = 60;
const MAX_DURATION_MOBILE = 30;

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(0);
  
  // Detect mobile (simple check)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const maxDuration = isMobile ? MAX_DURATION_MOBILE : MAX_DURATION_DESKTOP;

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setTrimStart(0);
  };

  const handleDurationLoad = (loadedDuration: number) => {
    setDuration(loadedDuration);
    setTrimEnd(Math.min(loadedDuration, maxDuration));
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">
          Convert Video to GIF
        </h2>
        <p className="text-[var(--muted)] max-w-2xl mx-auto">
          Drop a video file below (up to {maxDuration} seconds). 
          Trim, convert, and download—all in your browser.
        </p>
      </div>

      {!selectedFile ? (
        <FileUpload onFileSelect={handleFileSelect} />
      ) : (
        <>
          <VideoPreview 
            file={selectedFile} 
            onDurationLoad={handleDurationLoad}
            trimStart={trimStart}
            trimEnd={trimEnd}
          />
          
          <TrimSlider
            duration={duration}
            trimStart={trimStart}
            trimEnd={trimEnd}
            onTrimStartChange={setTrimStart}
            onTrimEndChange={setTrimEnd}
            maxDuration={maxDuration}
          />
          
          <div className="flex gap-4">
            <button
              onClick={() => setSelectedFile(null)}
              className="px-4 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              Choose Different File
            </button>
          </div>
        </>
      )}
    </div>
  );
}
