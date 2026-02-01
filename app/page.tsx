'use client';

import { useState, useRef } from 'react';
import { isFFmpegLoaded } from '@/lib/ffmpeg-preload';
import { getCompressionPreset } from '@/lib/compression';
import PreloaderScreen from '@/components/screens/PreloaderScreen';
import UploadScreen from '@/components/screens/UploadScreen';
import TrimScreen from '@/components/screens/TrimScreen';
import ConvertingScreen from '@/components/screens/ConvertingScreen';
import ResultScreen from '@/components/screens/ResultScreen';

type Screen = 'preloader' | 'upload' | 'trim' | 'converting' | 'result';

const MAX_DURATION_DESKTOP = 60;
const MAX_DURATION_MOBILE = 30;

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>(
    isFFmpegLoaded() ? 'upload' : 'preloader'
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(0);
  const [progress, setProgress] = useState(0);
  const [gifBlob, setGifBlob] = useState<Blob | null>(null);
  
  const workerRef = useRef<Worker | null>(null);
  
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const maxDuration = isMobile ? MAX_DURATION_MOBILE : MAX_DURATION_DESKTOP;

  const handlePreloaderComplete = () => {
    setCurrentScreen('upload');
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setCurrentScreen('trim');
  };

  const handleTrimConfirm = async (start: number, end: number) => {
    if (!selectedFile) return;

    setTrimStart(start);
    setTrimEnd(end);
    setCurrentScreen('converting');
    setProgress(0);

    try {
      const clipDuration = end - start;
      const preset = getCompressionPreset(clipDuration);

      workerRef.current = new Worker(
        new URL('../workers/converter.worker.ts', import.meta.url),
        { type: 'module' }
      );

      const workerTimeout = setTimeout(() => {
        workerRef.current?.terminate();
        workerRef.current = null;
        setCurrentScreen('upload');
        alert('Conversion timed out. Please try a shorter video.');
      }, 5 * 60 * 1000);

      workerRef.current.onmessage = (e) => {
        if (e.data.type === 'progress') {
          setProgress(e.data.progress);
        } else if (e.data.type === 'complete') {
          clearTimeout(workerTimeout);
          setGifBlob(e.data.gifBlob);
          setCurrentScreen('result');
          workerRef.current?.terminate();
          workerRef.current = null;
        } else if (e.data.type === 'error') {
          clearTimeout(workerTimeout);
          workerRef.current?.terminate();
          workerRef.current = null;
          setCurrentScreen('upload');
          alert('Conversion failed: ' + e.data.error);
        }
      };

      workerRef.current.onerror = () => {
        clearTimeout(workerTimeout);
        workerRef.current?.terminate();
        workerRef.current = null;
        setCurrentScreen('upload');
        alert('Conversion failed. Please try again.');
      };

      workerRef.current.postMessage({
        videoBlob: selectedFile,
        trimStart: start,
        trimEnd: end,
        width: preset.maxWidth,
        fps: preset.fps,
      });

    } catch (err) {
      setCurrentScreen('upload');
      alert('Conversion failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleTrimBack = () => {
    setSelectedFile(null);
    setCurrentScreen('upload');
  };

  const handleNewUpload = () => {
    setSelectedFile(null);
    setGifBlob(null);
    setProgress(0);
    setCurrentScreen('upload');
  };

  if (currentScreen === 'preloader') {
    return <PreloaderScreen onComplete={handlePreloaderComplete} />;
  }

  if (currentScreen === 'upload') {
    return <UploadScreen onFileSelect={handleFileSelect} />;
  }

  if (currentScreen === 'trim' && selectedFile) {
    return (
      <TrimScreen
        file={selectedFile}
        onConfirm={handleTrimConfirm}
        onBack={handleTrimBack}
        maxDuration={maxDuration}
      />
    );
  }

  if (currentScreen === 'converting') {
    return <ConvertingScreen progress={progress} />;
  }

  if (currentScreen === 'result' && gifBlob) {
    return <ResultScreen gifBlob={gifBlob} onNewUpload={handleNewUpload} />;
  }

  return <UploadScreen onFileSelect={handleFileSelect} />;
}
