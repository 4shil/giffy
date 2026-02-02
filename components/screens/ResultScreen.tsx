'use client';

import { useState, useEffect } from 'react';

interface ResultScreenProps {
  gifBlob: Blob;
  onNewUpload: () => void;
}

export default function ResultScreen({ gifBlob, onNewUpload }: ResultScreenProps) {
  const [gifUrl, setGifUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showDownloadHint, setShowDownloadHint] = useState(false);

  useEffect(() => {
    const url = URL.createObjectURL(gifBlob);
    setGifUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [gifBlob]);

  const handleDownload = () => {
    setDownloading(true);
    
    const a = document.createElement('a');
    a.href = gifUrl;
    a.download = `giffy-${Date.now()}.gif`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Show feedback
    setTimeout(() => {
      setDownloading(false);
      setShowDownloadHint(true);
      setTimeout(() => setShowDownloadHint(false), 4000);
    }, 500);
  };

  const handleShare = async () => {
    if (navigator.share && navigator.canShare()) {
      try {
        const file = new File([gifBlob], `giffy-${Date.now()}.gif`, { type: 'image/gif' });
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'My GIF from Giffy',
          });
        } else {
          await copyToClipboard();
        }
      } catch (err) {
        // User cancelled or error occurred
        if ((err as Error).name !== 'AbortError') {
          await copyToClipboard();
        }
      }
    } else {
      await copyToClipboard();
    }
  };

  const copyToClipboard = async () => {
    try {
      const item = new ClipboardItem({ 'image/gif': gifBlob });
      await navigator.clipboard.write([item]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Clipboard failed:', err);
      alert('Could not copy GIF. Please use the download button instead.');
    }
  };

  const fileSizeMB = (gifBlob.size / (1024 * 1024)).toFixed(2);
  const fileSizeKB = (gifBlob.size / 1024).toFixed(0);
  const displaySize = gifBlob.size > 1024 * 1024 ? `${fileSizeMB} MB` : `${fileSizeKB} KB`;

  const handleNewUpload = () => {
    if (confirm('Create a new GIF? Current one will be cleared.')) {
      onNewUpload();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4 sm:p-6">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-block bg-lime-500 px-4 py-2 border-4 border-black neo-shadow-sm">
            <h1 className="text-3xl sm:text-4xl font-black uppercase">
              ✨ SUCCESS!
            </h1>
          </div>
          <p className="text-base sm:text-lg font-bold text-gray-700">
            Your GIF is ready
          </p>
        </div>

        {/* GIF Preview */}
        <div className="bg-black border-4 border-black neo-shadow-lg overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={gifUrl} 
            alt="Your converted GIF" 
            className="w-full"
          />
        </div>

        {/* File Info */}
        <div className="text-center p-3 sm:p-4 bg-lime-50 border-4 border-black neo-shadow">
          <p className="text-xs sm:text-sm font-bold text-gray-700 uppercase">File Size</p>
          <p className="text-2xl sm:text-3xl font-black font-mono mt-1">
            {displaySize}
          </p>
        </div>

        {/* Download hint */}
        {showDownloadHint && (
          <div className="p-3 bg-lime-500 border-4 border-black neo-shadow text-center animate-pulse">
            <p className="text-sm font-black">
              ✓ Saved to your Downloads folder
            </p>
          </div>
        )}

        {/* Primary Action */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full bg-lime-500 text-black font-black px-6 py-5 border-4 border-black neo-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-xl sm:text-2xl uppercase disabled:opacity-60"
        >
          {downloading ? '⬇ DOWNLOADING...' : '⬇ DOWNLOAD GIF'}
        </button>

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <button
            onClick={handleShare}
            className="bg-white text-black font-black px-4 py-3 border-4 border-black neo-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-base sm:text-lg uppercase"
          >
            {copied ? '✓ COPIED' : '📋 COPY'}
          </button>
          
          <button
            onClick={handleNewUpload}
            className="bg-white text-black font-black px-4 py-3 border-4 border-black neo-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-base sm:text-lg uppercase"
          >
            + NEW
          </button>
        </div>

        {/* Footer */}
        <div className="text-center pt-2">
          <p className="text-xs sm:text-sm font-semibold text-gray-600">
            Made with Giffy • 100% Private • No Uploads
          </p>
        </div>
      </div>
    </div>
  );
}
