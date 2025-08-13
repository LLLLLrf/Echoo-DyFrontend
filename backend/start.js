const server = require('./server');
const VideoProcessor = require('./services/videoProcessor');
const config = require('./config');

// 创建视频处理器实例
const videoProcessor = new VideoProcessor();

// 定时清理过期任务
const startCleanupTask = () => {
  setInterval(() => {
    console.log('开始清理过期任务...');
    videoProcessor.cleanupExpiredTasks(config.cleanup.maxTaskAge);
  }, config.cleanup.interval);
};

// 启动清理任务
startCleanupTask();

console.log('🚀 Echoo Backend 启动完成');
console.log(`📁 上传目录: ${config.upload.uploadDir}`);
console.log(`🎬 视频目录: ${config.upload.videoDir}`);
console.log(`🧹 清理间隔: ${config.cleanup.interval / 1000 / 60} 分钟`); 