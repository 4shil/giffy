# Giffy API

Backend API for converting videos to GIFs using FFmpeg.

## API Endpoints

### Health Check
```
GET /health
```

### Convert Video to GIF
```
POST /api/convert
Content-Type: multipart/form-data

Fields:
- video: video file (required)
- trimStart: start time in seconds (optional)
- trimEnd: end time in seconds (optional)
- width: output width in pixels (default: 480)
- fps: frames per second (default: 15)

Returns: GIF file download
```

### Get Video Info
```
POST /api/info
Content-Type: multipart/form-data

Fields:
- video: video file (required)

Returns: JSON with duration, width, height, fps, size
```

## Installation

```bash
npm install
```

## Usage

```bash
# Development
npm run dev

# Production
npm start
```

## Environment Variables

```
PORT=3000  # Server port (default: 3000)
```

## Requirements

- Node.js ≥18
- FFmpeg installed on system

## Example cURL

```bash
# Convert video
curl -X POST http://localhost:3000/api/convert \
  -F "video=@video.mp4" \
  -F "trimStart=0" \
  -F "trimEnd=10" \
  -F "width=480" \
  -F "fps=15" \
  --output output.gif

# Get video info
curl -X POST http://localhost:3000/api/info \
  -F "video=@video.mp4"
```
