const app = getApp();

Page({
  data: {
    imagePath: '',
    audioPath: '',
    videoPath: '',
    isLoading: false,
    imageInfo: null,
    audioInfo: null,
    currentPage: 'detail', // 当前页面标识
    isLoggedIn: false,
    userInfo: null
  },

  onLoad: function (options) {
    // 页面加载时的初始化
    console.log('详情页加载完成');
    this.checkLoginStatus();
  },

  onShow: function () {
    // 页面显示时检查登录状态
    this.checkLoginStatus();
  },

  // 检查登录状态
  checkLoginStatus: function () {
    const isLoggedIn = app.isUserLoggedIn();
    const userInfo = app.getUserInfoSync();
    
    this.setData({
      isLoggedIn: isLoggedIn,
      userInfo: userInfo
    });

    // 如果未登录，提示用户
    if (!isLoggedIn) {
      tt.showModal({
        title: '需要登录',
        content: '请先登录抖音账号',
        showCancel: false,
        success: () => {
          // 返回首页
          tt.navigateBack();
        }
      });
    }
  },

  // 选择图片功能
  chooseImage: function () {
    if (!this.data.isLoggedIn) {
      tt.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    tt.chooseImage({
      count: 1,
      sizeType: ['compressed'], // 使用压缩图片
      sourceType: ['album', 'camera'], // 支持相册和相机
      success: (res) => {
        const imagePath = res.tempFilePaths[0];
        
        // 获取图片信息
        tt.getImageInfo({
          src: imagePath,
          success: (imageInfo) => {
            this.setData({
              imagePath: imagePath,
              imageInfo: {
                width: imageInfo.width,
                height: imageInfo.height,
                size: imageInfo.size || '未知'
              }
            });
            
            tt.showToast({
              title: '图片选择成功',
              icon: 'success'
            });
          },
          fail: (err) => {
            this.setData({
              imagePath: imagePath,
              imageInfo: null
            });
          }
        });
      },
      fail: (err) => {
        console.error('选择图片失败:', err);
        tt.showToast({
          title: '选择图片失败',
          icon: 'none'
        });
      }
    });
  },

  // 选择音频功能
  chooseAudio: function () {
    if (!this.data.isLoggedIn) {
      tt.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    tt.chooseMedia({
      count: 1,
      mediaType: ['video'], // 仅支持视频类型（抖音小程序可能不支持直接选择音频）
      sourceType: ['album'], // 仅从相册选择
      success: (res) => {
        const tempFiles = res.tempFiles;
        if (tempFiles && tempFiles.length > 0) {
          const audioFile = tempFiles[0];
          
          // 验证文件大小（限制为50MB）
          if (audioFile.size > 50 * 1024 * 1024) {
            tt.showToast({
              title: '文件过大，请选择小于50MB的文件',
              icon: 'none'
            });
            return;
          }

          this.setData({
            audioPath: audioFile.tempFilePath,
            audioInfo: {
              name: audioFile.name || '未命名',
              size: this.formatFileSize(audioFile.size)
            }
          });
          
          tt.showToast({
            title: '文件选择成功',
            icon: 'success'
          });
        }
      },
      fail: (err) => {
        console.error('选择文件失败:', err);
        tt.showToast({
          title: '选择文件失败',
          icon: 'none'
        });
      }
    });
  },

  // 上传文件并生成视频
  uploadFiles: function () {
    if (!this.data.isLoggedIn) {
      tt.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    if (!this.data.imagePath || !this.data.audioPath) {
      tt.showToast({
        title: '请先选择图片和音频',
        icon: 'none'
      });
      return;
    }

    this.setData({ isLoading: true });

    // 显示加载提示
    tt.showLoading({
      title: '正在处理...',
      mask: true
    });

    // 引入API配置
    const apiConfig = require('../../config/api.js');
    
    // 上传图片
    tt.uploadFile({
      url: apiConfig.getUploadUrl(), // 使用配置文件中的接口地址
      filePath: this.data.imagePath,
      name: 'image',
      formData: {
        audioPath: this.data.audioPath,
        timestamp: Date.now(),
        userId: this.data.userInfo ? this.data.userInfo.nickName : 'unknown'
      },
      success: (res) => {
        console.log('上传成功:', res);
        
        try {
          const responseData = JSON.parse(res.data);
          
          if (responseData.success && responseData.data && responseData.data.videoUrl) {
            // 下载生成的视频
            this.downloadVideo(responseData.data.videoUrl, responseData.data.taskId);
          } else {
            this.handleError('服务器返回数据格式错误');
          }
        } catch (e) {
          this.handleError('解析服务器响应失败');
        }
      },
      fail: (err) => {
        console.error('上传失败:', err);
        this.handleError('上传失败，请检查网络连接');
      }
    });
  },

  // 下载视频到本地
  downloadVideo: function (videoUrl, taskId) {
    tt.downloadFile({
      url: videoUrl,
      success: (downloadRes) => {
        tt.hideLoading();
        this.setData({
          videoPath: downloadRes.tempFilePath,
          isLoading: false
        });
        
        // 保存视频记录到本地存储
        this.saveVideoRecord(downloadRes.tempFilePath, taskId);
        
        tt.showToast({
          title: '视频生成成功！',
          icon: 'success'
        });
      },
      fail: (err) => {
        console.error('下载视频失败:', err);
        this.handleError('视频下载失败');
      }
    });
  },

  // 保存视频记录
  saveVideoRecord: function (videoPath, taskId) {
    const videoRecord = {
      id: taskId || Date.now().toString(),
      name: `视频_${new Date().toLocaleDateString()}`,
      path: videoPath,
      createTime: new Date().toLocaleString(),
      size: '未知',
      thumbnail: this.data.imagePath, // 使用选择的图片作为缩略图
      userId: this.data.userInfo ? this.data.userInfo.nickName : 'unknown'
    };

    // 获取现有记录
    let recentVideos = tt.getStorageSync('recentVideos') || [];
    recentVideos.unshift(videoRecord); // 添加到开头
    
    // 限制记录数量
    if (recentVideos.length > 20) {
      recentVideos = recentVideos.slice(0, 20);
    }
    
    // 保存记录
    tt.setStorageSync('recentVideos', recentVideos);
    
    // 更新统计数据
    this.updateStatistics();
  },

  // 更新统计数据
  updateStatistics: function () {
    let statistics = tt.getStorageSync('statistics') || {
      totalVideos: 0,
      totalSize: '0 MB',
      todayVideos: 0
    };
    
    statistics.totalVideos += 1;
    statistics.todayVideos += 1;
    
    tt.setStorageSync('statistics', statistics);
  },

  // 错误处理
  handleError: function (message) {
    tt.hideLoading();
    this.setData({ isLoading: false });
    
    tt.showToast({
      title: message,
      icon: 'none'
    });
  },

  // 格式化文件大小
  formatFileSize: function (bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // 预览图片
  previewImage: function () {
    if (this.data.imagePath) {
      tt.previewImage({
        urls: [this.data.imagePath],
        current: this.data.imagePath
      });
    }
  },

  // 播放音频
  playAudio: function () {
    if (this.data.audioPath) {
      const audioContext = tt.createInnerAudioContext();
      audioContext.src = this.data.audioPath;
      audioContext.play();
    }
  },

  // 保存视频到相册
  saveVideoToAlbum: function () {
    if (!this.data.videoPath) {
      tt.showToast({
        title: '没有可保存的视频',
        icon: 'none'
      });
      return;
    }

    tt.saveVideoToPhotosAlbum({
      filePath: this.data.videoPath,
      success: () => {
        tt.showToast({
          title: '视频已保存到相册',
          icon: 'success'
        });
      },
      fail: (err) => {
        console.error('保存视频失败:', err);
        tt.showToast({
          title: '保存失败，请检查权限',
          icon: 'none'
        });
      }
    });
  },

  // 导航切换事件处理
  onNavChange: function (e) {
    const { key } = e.detail;
    console.log('导航切换到:', key);
    
    if (key === 'profile') {
      // 跳转到我的页面
      tt.navigateTo({
        url: '/pages/profile/profile'
      });
    }
  }
});
