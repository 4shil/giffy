# Giffy

A fast, browser-based video to GIF converter with quality control and aggressive compression.

## Features

- Browser-based processing with complete privacy
- Fast conversion using FFmpeg.wasm
- Three quality presets with live file size estimates
- Aggressive compression for smaller files
- Copy to clipboard for instant sharing
- Native share sheet support on mobile
- Keyboard shortcuts for power users
- Mobile-optimized interface
- Real-time processing feedback with time estimates

## Quality Presets

**Low Quality**
- Resolution: 240p
- Frame rate: 6 fps
- Target size: 1-2 MB for typical clips
- Best for: Quick sharing, messaging apps

**Medium Quality**
- Resolution: 320p
- Frame rate: 8 fps
- Target size: 3-5 MB for typical clips
- Best for: Social media, general use

**High Quality**
- Resolution: 420p
- Frame rate: 12 fps
- Target size: 6-8 MB for typical clips
- Best for: Quality-focused sharing

## Keyboard Shortcuts

- `Space` - Play/Pause video
- `←` / `→` - Seek backward/forward 1 second
- `Home` - Jump to trim start
- `End` - Jump to trim end

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- FFmpeg.wasm
- Neo-brutalist design system

## Privacy

All video processing happens entirely in your browser. No files are uploaded to any server. Your videos never leave your device.

## Performance

Typical conversion times:
- 5 second clip: 5-10 seconds
- 10 second clip: 10-20 seconds
- 30 second clip: 30-60 seconds

Times vary based on quality setting and device performance.

## Browser Support

Works best on modern browsers with WebAssembly support:
- Chrome 87+
- Firefox 89+
- Safari 15.2+
- Edge 87+

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## License

MIT

## Live Demo

Visit: https://giffy-sand-kappa.vercel.app
