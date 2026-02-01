export default function Home() {
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

      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-12 border-2 border-dashed border-gray-300 dark:border-gray-700 text-center">
        <p className="text-[var(--muted)]">
          Upload component will go here
        </p>
      </div>
    </div>
  );
}
