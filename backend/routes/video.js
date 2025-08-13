const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const VideoProcessor = require('../services/videoProcessor');

const router = express.Router();

// 获取视频文件
router.get('/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const videoProcessor = new VideoProcessor();
    
    // 获取视频文件路径
    const videoPath = await videoProcessor.getVideoPath(taskId);
    
    if (!videoPath || !await fs.pathExists(videoPath)) {
      return res.status(404).json({
        success: false,
        message: '视频文件不存在'
      });
    }

    // 获取文件信息
    const stats = await fs.stat(videoPath);
    const fileSize = stats.size;
    const fileName = path.basename(videoPath);

    // 设置响应头
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Length', fileSize);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Cache-Control', 'public, max-age=3600');

    // 流式传输视频文件
    const videoStream = fs.createReadStream(videoPath);
    videoStream.pipe(res);

  } catch (error) {
    console.error('获取视频文件错误:', error);
    res.status(500).json({
      success: false,
      message: '获取视频文件失败'
    });
  }
});

// 获取视频信息
router.get('/:taskId/info', async (req, res) => {
  try {
    const { taskId } = req.params;
    const videoProcessor = new VideoProcessor();
    
    const info = await videoProcessor.getVideoInfo(taskId);
    
    if (!info) {
      return res.status(404).json({
        success: false,
        message: '视频信息不存在'
      });
    }

    res.json({
      success: true,
      data: info
    });

  } catch (error) {
    console.error('获取视频信息错误:', error);
    res.status(500).json({
      success: false,
      message: '获取视频信息失败'
    });
  }
});

// 删除视频文件
router.delete('/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const videoProcessor = new VideoProcessor();
    
    const result = await videoProcessor.deleteVideo(taskId);
    
    if (result.success) {
      res.json({
        success: true,
        message: '视频文件删除成功'
      });
    } else {
      res.status(404).json({
        success: false,
        message: result.error || '视频文件不存在'
      });
    }

  } catch (error) {
    console.error('删除视频文件错误:', error);
    res.status(500).json({
      success: false,
      message: '删除视频文件失败'
    });
  }
});

// 获取所有视频列表
router.get('/', async (req, res) => {
  try {
    const videoProcessor = new VideoProcessor();
    const videos = await videoProcessor.getAllVideos();
    
    res.json({
      success: true,
      data: videos
    });

  } catch (error) {
    console.error('获取视频列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取视频列表失败'
    });
  }
});

module.exports = router; 