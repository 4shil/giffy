export class VideoValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VideoValidationError';
  }
}

export class ConversionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConversionError';
  }
}

export class MemoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MemoryError';
  }
}

export function validateVideoFile(file: File): void {
  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
  const ACCEPTED_FORMATS = ['video/mp4', 'video/quicktime', 'video/webm'];

  if (!file) {
    throw new VideoValidationError('No file provided');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new VideoValidationError(
      `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds maximum of 100 MB`
    );
  }

  if (!ACCEPTED_FORMATS.includes(file.type)) {
    throw new VideoValidationError(
      `Unsupported format: ${file.type}. Please use MP4, MOV, or WEBM.`
    );
  }
}

export function validateVideoDuration(
  duration: number,
  maxDuration: number
): void {
  if (duration <= 0) {
    throw new VideoValidationError('Invalid video duration');
  }

  if (duration > maxDuration) {
    throw new VideoValidationError(
      `Video duration (${duration.toFixed(1)}s) exceeds maximum of ${maxDuration}s`
    );
  }
}

export function validateTrimPoints(
  trimStart: number,
  trimEnd: number,
  duration: number,
  maxDuration: number
): void {
  if (trimStart < 0 || trimEnd < 0) {
    throw new VideoValidationError('Trim points cannot be negative');
  }

  if (trimStart >= trimEnd) {
    throw new VideoValidationError('Trim start must be before trim end');
  }

  if (trimEnd > duration) {
    throw new VideoValidationError('Trim end exceeds video duration');
  }

  const clipDuration = trimEnd - trimStart;
  if (clipDuration > maxDuration) {
    throw new VideoValidationError(
      `Clip duration (${clipDuration.toFixed(1)}s) exceeds maximum of ${maxDuration}s`
    );
  }

  if (clipDuration < 0.1) {
    throw new VideoValidationError('Clip duration is too short (minimum 0.1s)');
  }
}

export function checkMemoryAvailable(): boolean {
  if (typeof performance === 'undefined' || !performance.memory) {
    return true; // Assume OK if we can't check
  }

  const memory = (performance as any).memory;
  const usedMemory = memory.usedJSHeapSize;
  const totalMemory = memory.jsHeapSizeLimit;
  const availableMemory = totalMemory - usedMemory;

  // Require at least 100MB free
  const REQUIRED_MEMORY = 100 * 1024 * 1024;

  return availableMemory > REQUIRED_MEMORY;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof VideoValidationError) {
    return error.message;
  }

  if (error instanceof ConversionError) {
    return `Conversion failed: ${error.message}`;
  }

  if (error instanceof MemoryError) {
    return `Memory error: ${error.message}. Try a shorter video.`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unknown error occurred. Please try again.';
}
