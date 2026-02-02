const express = require('express');
const multer = require('multer');
const cors = require('cors');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only video files allowed.'));
    }
  }
});

// Ensure directories exist
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
if (!fs.existsSync('output')) fs.mkdirSync('output');

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'giffy-api' });
});

// Convert video to GIF
app.post('/api/convert', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const {
      trimStart = 0,
      trimEnd,
      width = 480,
      fps = 15
    } = req.body;

    const inputPath = req.file.path;
    const outputFilename = `gif_${Date.now()}.gif`;
    const outputPath = path.join('output', outputFilename);

    // Build FFmpeg command
    let command = ffmpeg(inputPath)
      .outputOptions([
        '-vf', `fps=${fps},scale=${width}:-1:flags=lanczos`,
        '-loop', '0'
      ])
      .output(outputPath);

    // Add trim if specified
    if (trimStart) {
      command = command.setStartTime(parseFloat(trimStart));
    }
    if (trimEnd) {
      command = command.setDuration(parseFloat(trimEnd) - parseFloat(trimStart || 0));
    }

    // Execute conversion
    command
      .on('start', (cmd) => {
        console.log('FFmpeg command:', cmd);
      })
      .on('progress', (progress) => {
        console.log('Processing:', progress.percent + '% done');
      })
      .on('end', () => {
        // Clean up input file
        fs.unlinkSync(inputPath);

        // Send file
        res.download(outputPath, outputFilename, (err) => {
          if (err) {
            console.error('Download error:', err);
          }
          // Clean up output file after download
          setTimeout(() => {
            if (fs.existsSync(outputPath)) {
              fs.unlinkSync(outputPath);
            }
          }, 5000);
        });
      })
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        // Clean up
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        
        res.status(500).json({ error: 'Conversion failed', details: err.message });
      })
      .run();

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Get video info
app.post('/api/info', upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No video file provided' });
  }

  const inputPath = req.file.path;

  ffmpeg.ffprobe(inputPath, (err, metadata) => {
    // Clean up uploaded file
    fs.unlinkSync(inputPath);

    if (err) {
      return res.status(500).json({ error: 'Failed to read video info', details: err.message });
    }

    const videoStream = metadata.streams.find(s => s.codec_type === 'video');
    
    res.json({
      duration: metadata.format.duration,
      width: videoStream?.width,
      height: videoStream?.height,
      fps: eval(videoStream?.r_frame_rate || '0'),
      size: metadata.format.size
    });
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Giffy API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
