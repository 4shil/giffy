'use client';

import { useState, useCallback, DragEvent, ChangeEvent } from 'react';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
const ACCEPTED_FORMATS = ['video/mp4', 'video/quicktime', 'video/webm'];

interface UploadScreenProps {
  onFileSelect: (file: File) => void;
}

export default function UploadScreen({ onFileSelect }: UploadScreenProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    try {
      if (file.size > MAX_FILE_SIZE) {
        return `File too large (max 100 MB)`;
      }
      
      if (!ACCEPTED_FORMATS.includes(file.type)) {
        return 'Unsupported format. Use MP4, MOV, or WEBM.';
      }
      
      return null;
    } catch (err) {
      return 'Could not read file. Please try again.';
    }
  };

  const handleFile = useCallback((file: File) => {
    const validationError = validateFile(file);
    
    if (validationError) {
      setError(validationError);
      setTimeout(() => setError(null), 4000); // Auto-dismiss after 4s
      return;
    }
    
    setError(null);
    onFileSelect(file);
  }, [onFileSelect]);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4 sm:p-6">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-block bg-lime-500 px-4 py-2 border-4 border-black neo-shadow-sm">
            <h1 className="text-3xl sm:text-4xl font-black uppercase">
              SELECT VIDEO
            </h1>
          </div>
        </div>

        {/* Upload Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative border-4 sm:border-8 p-8 sm:p-12 text-center transition-all cursor-pointer
            ${isDragging 
              ? 'border-lime-500 bg-lime-50' 
              : 'border-black bg-white hover:bg-gray-50'
            }
            ${error ? 'border-red-600 animate-pulse' : ''}
            neo-shadow-lg
          `}
        >
          <input
            type="file"
            id="file-upload"
            accept="video/mp4,video/quicktime,video/webm"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="Upload video file"
            tabIndex={0}
          />
          
          <div className="pointer-events-none space-y-4">
            <div className="text-6xl sm:text-8xl">📹</div>
            
            <div className="space-y-2">
              <p className="text-xl sm:text-2xl font-black uppercase">
                DROP VIDEO HERE
              </p>
              <p className="text-sm sm:text-base text-gray-600 font-semibold">
                or click to browse files
              </p>
            </div>

            <div className="pt-2">
              <p className="text-sm font-semibold text-gray-700">
                MP4, MOV, or WEBM • Max 100 MB • Under 60 seconds
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-600 border-4 border-black neo-shadow text-white text-center animate-pulse">
            <p className="text-base sm:text-lg font-black">
              ⚠️ {error}
            </p>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-600">
            🔒 Everything runs in your browser • No files uploaded • 100% private
          </p>
        </div>
      </div>
    </div>
  );
}
