// API配置文件
const config = {
  // 开发环境
  development: {
    baseUrl: 'http://110.40.183.254:8001',
    uploadUrl: 'http://110.40.183.254:8001/api/upload',
    videoUrl: 'http://110.40.183.254:8001/api/video',
    loginUrl: 'http://110.40.183.254:8001/api/auth/login'
  },
  
  // 生产环境
  production: {
    baseUrl: 'http://110.40.183.254:8001',
    uploadUrl: 'http://110.40.183.254:8001/api/upload',
    videoUrl: 'http://110.40.183.254:8001/api/video',
    loginUrl: 'http://110.40.183.254:8001/api/auth/login'
  }
};

// 根据环境选择配置
const env = 'development'; // 可以改为 'production'
const currentConfig = config[env];

module.exports = {
  // 获取上传接口地址
  getUploadUrl: () => currentConfig.uploadUrl,
  
  // 获取视频接口地址
  getVideoUrl: () => currentConfig.videoUrl,
  
  // 获取登录接口地址
  getLoginUrl: () => currentConfig.loginUrl,
  
  // 获取基础URL
  getBaseUrl: () => currentConfig.baseUrl,
  
  // 获取完整配置
  getConfig: () => currentConfig
}; 