# Echoo Backend - 图片音频合成视频服务

## 项目简介

这是一个基于Node.js和FFmpeg的后端服务，用于将图片和音频文件合成为视频。支持多种图片和音频格式，提供RESTful API接口。

## 功能特性

- 🖼️ 支持多种图片格式：JPEG, PNG, GIF, WebP
- 🎵 支持多种音频格式：MP3, WAV, AAC, M4A
- 🎬 使用FFmpeg进行高质量视频合成
- 📊 实时处理进度和状态查询
- 🧹 自动清理临时文件和过期任务
- 🔒 文件类型和大小验证
- 📱 支持字节跳动小程序调用

## 技术栈

- **Node.js** - 运行环境
- **Express** - Web框架
- **FFmpeg** - 视频处理
- **Multer** - 文件上传
- **CORS** - 跨域支持
- **fs-extra** - 文件系统操作

## 安装和运行

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 启动服务

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

### 3. 访问服务

- 服务地址：http://localhost:3000
- 健康检查：http://localhost:3000/api/health
- API文档：http://localhost:3000

## API接口

### 1. 上传文件并生成视频

**POST** `/api/upload`

**请求参数：**
- `image`: 图片文件 (multipart/form-data)
- `audio`: 音频文件 (multipart/form-data)

**响应示例：**
```json
{
  "success": true,
  "message": "视频生成成功",
  "data": {
    "taskId": "uuid-string",
    "videoUrl": "/videos/uuid-string.mp4",
    "duration": 120.5,
    "fileSize": 2048576
  }
}
```

### 2. 获取任务状态

**GET** `/api/upload/status/:taskId`

**响应示例：**
```json
{
  "success": true,
  "data": {
    "status": "completed",
    "message": "视频生成完成",
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

### 3. 下载视频文件

**GET** `/api/video/:taskId`

### 4. 获取视频信息

**GET** `/api/video/:taskId/info`

### 5. 删除视频文件

**DELETE** `/api/video/:taskId`

### 6. 获取所有视频列表

**GET** `/api/video`

## 目录结构

```
backend/
├── server.js              # 主服务器文件
├── start.js               # 启动脚本
├── config.js              # 配置文件
├── package.json           # 项目配置
├── README.md              # 说明文档
├── routes/                # 路由文件
│   ├── upload.js          # 上传路由
│   └── video.js           # 视频路由
├── services/              # 服务文件
│   └── videoProcessor.js  # 视频处理服务
├── uploads/               # 上传文件目录
├── videos/                # 生成的视频目录
└── temp/                  # 临时文件目录
```

## 配置说明

在 `config.js` 中可以修改以下配置：

- **服务器端口**：默认3000
- **文件大小限制**：默认50MB
- **视频分辨率**：默认1280x720
- **视频帧率**：默认30fps
- **音频比特率**：默认128k
- **清理间隔**：默认1小时
- **任务过期时间**：默认24小时

## 视频处理参数

- **视频编码器**：H.264 (libx264)
- **音频编码器**：AAC
- **像素格式**：YUV420P
- **视频时长**：根据音频时长自动设置
- **视频质量**：高质量压缩

## 错误处理

服务包含完善的错误处理机制：

- 文件类型验证
- 文件大小限制
- 网络错误处理
- FFmpeg处理错误
- 文件系统错误

## 性能优化

- 异步文件处理
- 流式文件传输
- 自动清理临时文件
- 任务状态缓存
- 内存使用优化

## 部署说明

### 开发环境

```bash
npm run dev
```

### 生产环境

```bash
npm start
```

### Docker部署

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 注意事项

1. 确保系统已安装FFmpeg
2. 检查文件目录权限
3. 监控磁盘空间使用
4. 定期清理过期文件
5. 配置适当的CORS策略

## 许可证

MIT License 