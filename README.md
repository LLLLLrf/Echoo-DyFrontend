# Echoo MV生成

## 功能描述

这是一个字节跳动小程序页面，实现以下功能：
1. 上传一张图片
2. 上传一段音频文件
3. 将图片和音频发送到后端进行处理
4. 接收后端返回的视频文件并保存到本地
5. 支持视频预览和保存到相册

## 文件结构

```
pages/detail/
├── detail.js      # 页面逻辑
├── detail.ttml    # 页面模板
├── detail.ttss    # 页面样式
└── detail.json    # 页面配置

config/
└── api.js         # API配置文件
```

## 主要功能

### 1. 图片上传
- 支持从相册选择或拍照
- 自动压缩图片以优化性能
- 显示图片预览和尺寸信息
- 点击图片可全屏预览

### 2. 音频上传
- 支持多种音频格式：mp3, wav, aac, m4a
- 文件大小限制：50MB
- 显示文件名和大小信息
- 支持音频试听功能

### 3. 视频生成
- 上传图片和音频到后端
- 实时显示处理进度
- 自动下载生成的视频
- 支持视频预览播放

### 4. 视频管理
- 视频预览功能
- 保存视频到相册
- 错误处理和用户提示

## 配置说明

### API配置
在 `config/api.js` 中配置后端接口地址：

```javascript
const config = {
  development: {
    uploadUrl: 'http://localhost:3000/api/upload',
    videoUrl: 'http://localhost:3000/api/video'
  },
  production: {
    uploadUrl: 'https://your-domain.com/api/upload',
    videoUrl: 'https://your-domain.com/api/video'
  }
};
```

### 后端接口要求

#### 上传接口
- **URL**: `/api/upload`
- **方法**: POST
- **参数**:
  - `image`: 图片文件
  - `audioPath`: 音频文件路径
  - `timestamp`: 时间戳

#### 返回格式
```json
{
  "success": true,
  "videoUrl": "https://example.com/video.mp4",
  "message": "处理成功"
}
```

## 使用步骤

1. **选择图片**：点击"选择图片"按钮，从相册选择或拍照
2. **选择音频**：点击"选择音频文件"按钮，选择音频文件
3. **生成视频**：点击"上传并生成视频"按钮开始处理
4. **预览视频**：处理完成后可以预览生成的视频
5. **保存视频**：点击"保存到相册"将视频保存到本地

## 注意事项

1. 确保后端服务正常运行
2. 检查网络连接状态
3. 音频文件大小不要超过50MB
4. 需要相册访问权限才能保存视频
5. 建议在WiFi环境下使用，避免消耗过多流量

## 错误处理

- 网络错误：提示用户检查网络连接
- 文件格式错误：提示用户选择正确的文件格式
- 文件过大：提示用户选择较小的文件
- 权限错误：提示用户授权相关权限

## 开发环境

- 字节跳动小程序开发工具
- Node.js 后端服务
- 支持的文件格式：图片(jpg, png, gif)，音频(mp3, wav, aac, m4a) 