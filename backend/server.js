const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
require('dotenv').config();

// 导入路由
const uploadRoutes = require('./routes/upload');
const videoRoutes = require('./routes/video');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/videos', express.static(path.join(__dirname, 'videos')));

// 创建必要的目录
const createDirectories = async () => {
  const dirs = ['uploads', 'videos', 'temp'];
  for (const dir of dirs) {
    await fs.ensureDir(path.join(__dirname, dir));
  }
};

// 路由
app.use('/api/upload', uploadRoutes);
app.use('/api/video', videoRoutes);

// 健康检查接口
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Echoo Backend Service is running',
    timestamp: new Date().toISOString()
  });
});

// 根路径
app.get('/', (req, res) => {
  res.json({
    name: 'Echoo Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      upload: '/api/upload',
      video: '/api/video'
    }
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在'
  });
});

// 启动服务器
const startServer = async () => {
  try {
    await createDirectories();
    
    app.listen(PORT, () => {
      console.log(`🚀 Echoo Backend Server is running on port ${PORT}`);
      console.log(`📁 Upload directory: ${path.join(__dirname, 'uploads')}`);
      console.log(`🎬 Video directory: ${path.join(__dirname, 'videos')}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 