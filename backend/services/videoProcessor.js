const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');

// 设置FFmpeg路径
const ffmpegPath = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegPath);

class VideoProcessor {
  constructor() {
    this.videosDir = path.join(__dirname, '../videos');
    this.tempDir = path.join(__dirname, '../temp');
    this.tasks = new Map(); // 存储任务状态
  }

  // 处理视频生成
  async processVideo({ taskId, imagePath, audioPath, imageName, audioName }) {
    try {
      console.log(`开始处理视频任务: ${taskId}`);
      
      // 更新任务状态
      this.updateTaskStatus(taskId, 'processing', '正在处理视频...');

      // 获取音频时长
      const audioDuration = await this.getAudioDuration(audioPath);
      if (!audioDuration) {
        throw new Error('无法获取音频时长');
      }

      // 生成输出视频路径
      const outputFileName = `${taskId}.mp4`;
      const outputPath = path.join(this.videosDir, outputFileName);

      // 使用FFmpeg合成视频
      await this.createVideoFromImageAndAudio(imagePath, audioPath, outputPath, audioDuration);

      // 获取视频信息
      const videoInfo = await this.getVideoInfo(outputPath);
      
      // 更新任务状态
      this.updateTaskStatus(taskId, 'completed', '视频生成完成', {
        videoPath: outputPath,
        videoUrl: `/videos/${outputFileName}`,
        duration: videoInfo.duration,
        fileSize: videoInfo.fileSize,
        createdAt: new Date().toISOString()
      });

      // 清理临时文件
      await this.cleanupTempFiles([imagePath, audioPath]);

      console.log(`视频处理完成: ${taskId}`);
      
      return {
        success: true,
        taskId,
        videoUrl: `/videos/${outputFileName}`,
        duration: videoInfo.duration,
        fileSize: videoInfo.fileSize
      };

    } catch (error) {
      console.error(`视频处理失败: ${taskId}`, error);
      
      // 更新任务状态
      this.updateTaskStatus(taskId, 'failed', error.message);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 从图片和音频创建视频
  createVideoFromImageAndAudio(imagePath, audioPath, outputPath, duration) {
    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(imagePath)
        .input(audioPath)
        .outputOptions([
          '-c:v libx264',           // 视频编码器
          '-c:a aac',               // 音频编码器
          '-b:a 128k',              // 音频比特率
          '-pix_fmt yuv420p',       // 像素格式
          '-shortest',              // 以最短的输入流为准
          '-t', duration.toString(), // 设置视频时长
          '-vf scale=1280:720',     // 设置视频分辨率
          '-r 30'                   // 设置帧率
        ])
        .output(outputPath)
        .on('start', (commandLine) => {
          console.log('FFmpeg 命令:', commandLine);
        })
        .on('progress', (progress) => {
          console.log(`处理进度: ${progress.percent}%`);
        })
        .on('end', () => {
          console.log('视频生成完成');
          resolve();
        })
        .on('error', (err) => {
          console.error('FFmpeg 错误:', err);
          reject(err);
        })
        .run();
    });
  }

  // 获取音频时长
  getAudioDuration(audioPath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(audioPath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          const duration = metadata.format.duration;
          resolve(duration);
        }
      });
    });
  }

  // 获取视频信息
  async getVideoInfo(videoPath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          const stats = fs.statSync(videoPath);
          resolve({
            duration: metadata.format.duration,
            fileSize: stats.size,
            format: metadata.format.format_name,
            videoStream: metadata.streams.find(s => s.codec_type === 'video'),
            audioStream: metadata.streams.find(s => s.codec_type === 'audio')
          });
        }
      });
    });
  }

  // 更新任务状态
  updateTaskStatus(taskId, status, message, data = {}) {
    this.tasks.set(taskId, {
      status,
      message,
      timestamp: new Date().toISOString(),
      ...data
    });
  }

  // 获取任务状态
  getStatus(taskId) {
    return this.tasks.get(taskId) || null;
  }

  // 获取视频路径
  async getVideoPath(taskId) {
    const task = this.tasks.get(taskId);
    if (task && task.status === 'completed') {
      return task.videoPath;
    }
    return null;
  }

  // 获取视频信息
  async getVideoInfo(taskId) {
    const task = this.tasks.get(taskId);
    if (task && task.status === 'completed') {
      return {
        taskId,
        videoUrl: task.videoUrl,
        duration: task.duration,
        fileSize: task.fileSize,
        createdAt: task.createdAt,
        status: task.status
      };
    }
    return null;
  }

  // 删除视频
  async deleteVideo(taskId) {
    try {
      const videoPath = await this.getVideoPath(taskId);
      if (videoPath && await fs.pathExists(videoPath)) {
        await fs.remove(videoPath);
        this.tasks.delete(taskId);
        return { success: true };
      }
      return { success: false, error: '视频文件不存在' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // 获取所有视频
  async getAllVideos() {
    const videos = [];
    for (const [taskId, task] of this.tasks.entries()) {
      if (task.status === 'completed') {
        videos.push({
          taskId,
          videoUrl: task.videoUrl,
          duration: task.duration,
          fileSize: task.fileSize,
          createdAt: task.createdAt
        });
      }
    }
    return videos;
  }

  // 清理临时文件
  async cleanupTempFiles(filePaths) {
    for (const filePath of filePaths) {
      try {
        if (await fs.pathExists(filePath)) {
          await fs.remove(filePath);
          console.log(`清理临时文件: ${filePath}`);
        }
      } catch (error) {
        console.error(`清理文件失败: ${filePath}`, error);
      }
    }
  }

  // 清理过期任务
  cleanupExpiredTasks(maxAge = 24 * 60 * 60 * 1000) { // 默认24小时
    const now = new Date();
    for (const [taskId, task] of this.tasks.entries()) {
      const taskTime = new Date(task.timestamp);
      if (now - taskTime > maxAge) {
        this.tasks.delete(taskId);
        console.log(`清理过期任务: ${taskId}`);
      }
    }
  }
}

module.exports = VideoProcessor; 