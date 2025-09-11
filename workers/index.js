// Media Processing Worker
const Queue = require('bull');
const Redis = require('ioredis');
const Minio = require('minio');
const ffmpeg = require('ffmpeg-static');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Redis connection
const redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379');

// MinIO client
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'minio',
  port: 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123'
});

// Create queues
const mediaQueue = new Queue('media processing', process.env.REDIS_URL || 'redis://redis:6379');

// Process media files
mediaQueue.process('process-video', async (job) => {
  const { filePath, fileName, bucket } = job.data;
  
  console.log(`Processing video: ${fileName}`);
  
  try {
    // Create output directory
    const outputDir = path.join('/tmp/media', path.dirname(fileName));
    await fs.promises.mkdir(outputDir, { recursive: true });
    
    // Generate thumbnail
    const thumbnailPath = path.join(outputDir, `${path.parse(fileName).name}_thumb.jpg`);
    await generateThumbnail(filePath, thumbnailPath);
    
    // Upload thumbnail to MinIO
    await minioClient.fPutObject(bucket, `thumbnails/${fileName}_thumb.jpg`, thumbnailPath);
    
    // Clean up temporary files
    await fs.promises.unlink(thumbnailPath);
    
    console.log(`Video processed successfully: ${fileName}`);
    
    return { success: true, thumbnail: `thumbnails/${fileName}_thumb.jpg` };
  } catch (error) {
    console.error(`Error processing video ${fileName}:`, error);
    throw error;
  }
});

// Generate thumbnail from video
function generateThumbnail(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const command = `${ffmpeg} -i "${inputPath}" -ss 00:00:01 -vframes 1 -q:v 2 "${outputPath}"`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

// Handle job completion
mediaQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed:`, result);
});

// Handle job failure
mediaQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down media worker...');
  await mediaQueue.close();
  await redis.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Shutting down media worker...');
  await mediaQueue.close();
  await redis.disconnect();
  process.exit(0);
});

console.log('Media worker started and waiting for jobs...');
