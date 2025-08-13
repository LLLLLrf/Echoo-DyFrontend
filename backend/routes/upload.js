const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const VideoProcessor = require('../services/videoProcessor');

const router = express.Router();

// 配置multer存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    fs.ensureDirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const allowedAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/aac', 'audio/mp4'];
  
  if (allowedImageTypes.includes(file.mimetype) || allowedAudioTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型'), false);
  }
};

// 配置multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 2 // 最多2个文件
  }
});

// 上传图片和音频，生成视频
router.post('/', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('收到上传请求:', req.files);
    console.log('表单数据:', req.body);

    // 检查文件
    if (!req.files || !req.files.image || !req.files.audio) {
      return res.status(400).json({
        success: false,
        message: '请上传图片和音频文件'
      });
    }

    const imageFile = req.files.image[0];
    const audioFile = req.files.audio[0];

    // 验证文件类型
    const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const audioTypes = ['audio/mpeg', 'audio/wav', 'audio/aac', 'audio/mp4'];

    if (!imageTypes.includes(imageFile.mimetype)) {
      return res.status(400).json({
        success: false,
        message: '图片格式不支持'
      });
    }

    if (!audioTypes.includes(audioFile.mimetype)) {
      return res.status(400).json({
        success: false,
        message: '音频格式不支持'
      });
    }

    // 生成任务ID
    const taskId = uuidv4();
    
    // 创建视频处理器实例
    const videoProcessor = new VideoProcessor();
    
    // 处理视频生成
    const result = await videoProcessor.processVideo({
      taskId,
      imagePath: imageFile.path,
      audioPath: audioFile.path,
      imageName: imageFile.originalname,
      audioName: audioFile.originalname
    });

    if (result.success) {
      res.json({
        success: true,
        message: '视频生成成功',
        data: {
          taskId: result.taskId,
          videoUrl: result.videoUrl,
          duration: result.duration,
          fileSize: result.fileSize
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error || '视频生成失败'
      });
    }

  } catch (error) {
    console.error('上传处理错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器处理错误',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
});

// 获取上传状态
router.get('/status/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const videoProcessor = new VideoProcessor();
    const status = await videoProcessor.getStatus(taskId);
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('获取状态错误:', error);
    res.status(500).json({
      success: false,
      message: '获取状态失败'
    });
  }
});

module.exports = router; 