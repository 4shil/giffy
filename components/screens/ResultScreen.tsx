'use client';

import { useState, useEffect } from 'react';

interface ResultScreenProps {
  gifBlob: Blob;
  onNewUpload: () => void;
}

export default function ResultScreen({ gifBlob, onNewUpload }: ResultScreenProps) {
  const [gifUrl, setGifUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const url = URL.createObjectURL(gifBlob);
    setGifUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [gifBlob]);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = gifUrl;
    a.download = `giffy-${Date.now()}.gif`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
          // Fallback to clipboard
          await copyToClipboard();
        }
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback: copy to clipboard
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
    }
  };

  const fileSizeMB = (gifBlob.size / (1024 * 1024)).toFixed(2);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-block bg-lime-500 px-4 py-2 border-4 border-black neo-shadow-sm">
            <h1 className="text-4xl sm:text-5xl font-black uppercase">
              ✨ DONE!
            </h1>
          </div>
          <p className="text-lg font-bold text-gray-700">
            Your GIF is ready
          </p>
        </div>

        {/* GIF Preview */}
        <div className="bg-black border-4 border-black neo-shadow-lg overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={gifUrl} 
            alt="Generated GIF" 
            className="w-full"
          />
        </div>

        {/* File Info */}
        <div className="text-center p-4 bg-lime-50 border-4 border-black neo-shadow">
          <p className="text-sm font-bold text-gray-700">FILE SIZE</p>
          <p className="text-3xl font-black font-mono mt-1">
            {fileSizeMB} MB
          </p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={handleDownload}
            className="bg-lime-500 text-black font-black px-6 py-4 border-4 border-black neo-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-xl uppercase"
          >
            ⬇ DOWNLOAD
          </button>
          
          <button
            onClick={handleShare}
            className="bg-white text-black font-black px-6 py-4 border-4 border-black neo-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-xl uppercase"
          >
            {copied ? '✓ COPIED!' : '🔗 SHARE'}
          </button>
        </div>

        {/* New Upload */}
        <div className="text-center">
          <button
            onClick={onNewUpload}
            className="bg-white text-gray-700 font-black px-8 py-3 border-4 border-black neo-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-lg uppercase"
          >
            + NEW UPLOAD
          </button>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm font-bold text-gray-600">
            Made with Giffy • No uploads • 100% Private
          </p>
        </div>
      </div>
    </div>
  );
}
