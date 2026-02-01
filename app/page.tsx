'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">
          Convert Video to GIF
        </h2>
        <p className="text-[var(--muted)] max-w-2xl mx-auto">
          Drop a video file below (up to 60 seconds). 
          Trim, convert, and download—all in your browser.
        </p>
      </div>

      <FileUpload onFileSelect={handleFileSelect} />

      {selectedFile && (
        <div className="p-4 bg-green-50 dark:bg-green-950 border border-[var(--success)] rounded-lg">
          <p className="text-sm text-[var(--success)] font-medium">
            ✓ {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
          </p>
        </div>
      )}
    </div>
  );
}
