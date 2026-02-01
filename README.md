# Giffy - Instant Video to GIF Converter

Convert videos up to 60 seconds into GIFs instantly. No upload, no tracking, fully browser-based.

## Features

- **Drag & Drop Upload** - Simple file selection
- **Video Trimming** - Precise start/end control
- **Adaptive Compression** - Auto-optimized based on duration
- **Progress Tracking** - Real-time conversion updates
- **Privacy First** - Everything runs in your browser
- **No Server Processing** - Files never leave your device
- **Mobile Optimized** - Works on all screen sizes
- **Accessible** - Full keyboard navigation and ARIA labels

## Tech Stack

- **Next.js 15** - React framework
- **FFmpeg.wasm** - In-browser video processing
- **Web Workers** - Non-blocking conversion
- **Tailwind CSS** - Responsive styling
- **TypeScript** - Type safety

## Compression Presets

| Duration | Max Width | FPS |
|----------|-----------|-----|
| 0-10s    | 720px     | 15  |
| 10-30s   | 480px     | 12  |
| 30-60s   | 360px     | 10  |

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Build

```bash
npm run build
npm start
```

## Deploy

Giffy is a static Next.js app. Deploy to Vercel, Netlify, or any static hosting.

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Deploy

The app requires these headers for SharedArrayBuffer (configured in `next.config.ts`):
- `Cross-Origin-Embedder-Policy: require-corp`
- `Cross-Origin-Opener-Policy: same-origin`

## License

MIT

## Credits

Built with FFmpeg.wasm
