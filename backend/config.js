// 应用配置文件
module.exports = {
  // 服务器配置
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost'
  },

  // 文件上传配置
  upload: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    uploadDir: 'uploads',
    videoDir: 'videos',
    tempDir: 'temp',
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedAudioTypes: ['audio/mpeg', 'audio/wav', 'audio/aac', 'audio/mp4']
  },

  // 视频处理配置
  video: {
    width: 1280,
    height: 720,
    framerate: 30,
    audioBitrate: '128k',
    videoCodec: 'libx264',
    audioCodec: 'aac',
    pixelFormat: 'yuv420p'
  },

  // 清理配置
  cleanup: {
    interval: 60 * 60 * 1000, // 1小时
    maxTaskAge: 24 * 60 * 60 * 1000 // 24小时
  },

  // 环境配置
  env: process.env.NODE_ENV || 'development',
  
  // 日志配置
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log'
  }
}; 