// routes/uploadRoutes.ts
import { Router, Request, Response } from 'express';
import multer from 'multer';
import { Request as JwtRequest } from 'express-jwt';

import authenticateToken from '../middlewares/authMiddleware';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import Video from '../models/videoModel';
import checkScope from '../middlewares/scopeMiddleware';

const router = Router();
const upload = multer({ dest: 'uploads/' });

/**
 * @swagger
 * tags:
 *   name: Videos
 *   description: Video upload and management endpoints
 */

/**
 * @swagger
 * /videos/upload:
 *   post:
 *     tags: [Videos]
 *     summary: Upload a new video
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               video:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Video uploaded successfully
 *       400:
 *         description: No file uploaded
 */
router.post('/upload', authenticateToken, checkScope('UPLOAD_VIDEO'), upload.single('video'), async (req: JwtRequest, res: Response) => {
  if (!req.file) {
    res.status(400).send('No file uploaded.');
    return;
  }

  const inputFilePath = req.file.path;
  const outputDir = path.join('uploads', 'hls', req.file.filename).replace(/\\/g, '/');
  const outputUrl = `${process.env.BASE_URL}/hls/${req.file.filename}/master.m3u8`;
  fs.mkdirSync(outputDir, { recursive: true });

  // Save video to database with status 'processing'
  const video = new Video({
    filename: req.file.filename,
    status: 'processing',
    path: outputUrl,
    user: req.auth?.userId,
    url: outputUrl
  });

  await video.save();

  // Respond to the user immediately
  res.status(200).send('Video uploaded successfully and is being processed.');

  // Process the video in the background
  ffmpeg.ffprobe(inputFilePath, (err, metadata) => {
    if (err) {
      console.error('Error during probing:', err);
      return;
    }

    const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
    if (!videoStream || videoStream.width === undefined || videoStream.height === undefined) {
      console.error('No valid video stream found.');
      return;
    }

    const resolutions = [
      { width: 1920, height: 1080, bitrate: '5000k' },
      { width: 1280, height: 720, bitrate: '2800k' },
      { width: 854, height: 480, bitrate: '1400k' },
      { width: 640, height: 360, bitrate: '800k' }
    ];

    if (videoStream.width >= 3840 && videoStream.height >= 2160) {
      resolutions.unshift({ width: 3840, height: 2160, bitrate: '12000k' });
    }

    const outputOptions = [
      '-profile:v baseline',
      '-level 3.0',
      '-start_number 0',
      '-hls_time 10',
      '-hls_list_size 0',
      '-f hls'
    ];

    const masterPlaylist = ['#EXTM3U\n'];

    let completedResolutions = 0;

    resolutions.forEach((resolution, index) => {
      const outputPath = path.join(outputDir, `${resolution.width}x${resolution.height}_index.m3u8`).replace(/\\/g, '/');
      masterPlaylist.push(`#EXT-X-STREAM-INF:BANDWIDTH=${parseInt(resolution.bitrate) * 1000},RESOLUTION=${resolution.width}x${resolution.height}\n`);
      masterPlaylist.push(`${resolution.width}x${resolution.height}_index.m3u8\n`);

      ffmpeg(inputFilePath)
        .size(`${resolution.width}x${resolution.height}`)
        .videoBitrate(resolution.bitrate)
        .outputOptions(outputOptions)
        .output(outputPath)
        .on('start', (commandLine) => {
          console.log('Spawned Ffmpeg with command: ' + commandLine);
        })
        .on('end', async () => {
          console.log(`Finished processing resolution: ${resolution.width}x${resolution.height}`);
          completedResolutions++;

          // Check if all resolutions are processed
          if (completedResolutions === resolutions.length) {
            // Update video status to 'ready' in the database
            video.status = 'ready';
            await video.save();

            // Remove the uploaded file
            fs.unlink(inputFilePath, (err) => {
              if (err) {
                console.error('Error deleting the uploaded file:', err);
              } else {
                console.log('Uploaded file deleted successfully.');
              }
            });
          }
        })
        .on('error', (err) => {
          console.error('Error during conversion:', err);
        })
        .run();
    });

    fs.writeFileSync(path.join(outputDir, 'master.m3u8'), masterPlaylist.join(''));
  });
});

/**
 * @swagger
 * /videos/{id}:
 *   delete:
 *     tags: [Videos]
 *     summary: Delete a video by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The video ID
 *     responses:
 *       200:
 *         description: Video deleted successfully
 *       404:
 *         description: Video not found
 */
router.delete('/:id', authenticateToken, checkScope('DELETE_VIDEO'), async (req: JwtRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;
    const video = await Video.findOne({ _id: req.params.id, user: userId });

    if (!video) {
      res.status(404).send('Video not found or you are not authorized to delete it.');
      return;
    }

    // Delete video file from the filesystem
    const videoPath = path.join('uploads', 'hls', video.filename);
    fs.rmSync(videoPath, { recursive: true, force: true });

    // Remove video from the database
    await video.deleteOne();

    res.status(200).send('Video deleted successfully.');
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).send('Internal server error.');
  }
});

export default router;
