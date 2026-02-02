'use client';

interface ConvertingScreenProps {
  progress: number;
  clipDuration: number;
  onCancel: () => void;
}

export default function ConvertingScreen({ progress, clipDuration, onCancel }: ConvertingScreenProps) {
  // Rough estimate: 2x the clip duration
  const estimatedTotalSeconds = Math.max(5, Math.ceil(clipDuration * 2));
  const elapsedSeconds = Math.ceil((progress / 100) * estimatedTotalSeconds);
  const remainingSeconds = Math.max(0, estimatedTotalSeconds - elapsedSeconds);

  const handleCancel = () => {
    if (confirm('Cancel conversion? You\'ll go back to trimming.')) {
      onCancel();
    }
  };

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
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight mb-2">
            CONVERTING
          </h1>
          <p className="text-lg font-semibold text-gray-700">
            About {remainingSeconds}s remaining
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3">
          <div 
            className="w-full bg-white border-4 border-black h-14 overflow-hidden"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Conversion progress"
          >
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
          
          <p className="text-sm font-semibold text-gray-600">
            Processing in your browser • No upload
          </p>
        </div>

        {/* Cancel button */}
        <button
          onClick={handleCancel}
          className="text-sm font-bold text-gray-600 hover:text-black underline transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
