'use client';

interface ConvertingScreenProps {
  progress: number;
}

export default function ConvertingScreen({ progress }: ConvertingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Animated Icon */}
        <div className="relative">
          <div className="w-32 h-32 mx-auto bg-lime-500 border-4 border-black neo-shadow-lg flex items-center justify-center animate-pulse">
            <span className="text-6xl">⚡</span>
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tight mb-2">
            CONVERTING
          </h1>
          <p className="text-xl font-bold text-gray-700">
            Please wait...
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-4">
          <div className="w-full bg-white border-4 border-black h-12 overflow-hidden">
            <div 
              className="h-full bg-lime-500 transition-all duration-300 flex items-center justify-center"
              style={{ width: `${progress}%` }}
            >
              {progress > 5 && (
                <span className="text-2xl font-black text-black">
                  {progress}%
                </span>
              )}
            </div>
          </div>
          
          <p className="text-sm font-bold text-gray-600">
            Processing in your browser • No upload
          </p>
        </div>
      </div>
    </div>
  );
}
