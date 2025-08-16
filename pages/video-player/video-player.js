Page({
  data: {
    videoUrl: '',
    isPlaying: true,
    isSaving: false,
    isFullscreen: false,
    showFullscreenControls: false
  },

  onLoad(options) {
    this.setData({
      videoUrl: decodeURIComponent(options.url)
    });
  },

  onReady() {
    this.videoContext = tt.createVideoContext('myVideo');
    
    // 监听视频全屏状态变化
    this.videoContext.onFullscreenChange((res) => {
      console.log('全屏状态变化:', res);
      this.setData({
        isFullscreen: res.fullScreen
      });
      
      // 全屏时显示控制按钮
      if (res.fullScreen) {
        this.showFullscreenControls();
      }
    });
  },

  // 显示全屏控制按钮
  showFullscreenControls() {
    this.setData({
      showFullscreenControls: true
    });
    
    // 3秒后自动隐藏
    setTimeout(() => {
      if (this.data.isFullscreen) {
        this.setData({
          showFullscreenControls: false
        });
      }
    }, 3000);
  },

  // 点击屏幕显示控制按钮
  onVideoTap() {
    if (this.data.isFullscreen) {
      this.showFullscreenControls();
    }
  },

  togglePlay() {
    if (this.data.isPlaying) {
      this.videoContext.pause();
    } else {
      this.videoContext.play();
    }
    this.setData({
      isPlaying: !this.data.isPlaying
    });
  },

  // 切换全屏
  toggleFullscreen() {
    if (this.data.isFullscreen) {
      this.videoContext.exitFullScreen();
    } else {
      this.videoContext.requestFullScreen();
    }
  },

  // 保存视频到本地
  saveToLocal() {
    if (this.data.isSaving) {
      return; // 防止重复点击
    }

    if (!this.data.videoUrl) {
      tt.showToast({
        title: '视频地址无效',
        icon: 'none'
      });
      return;
    }

    this.setData({ isSaving: true });

    // 显示保存进度
    tt.showLoading({
      title: '正在保存...'
    });

    // 下载视频文件
    tt.downloadFile({
      url: this.data.videoUrl,
      success: (res) => {
        console.log('下载成功:', res);
        
        if (res.statusCode === 200) {
          // 保存到相册
          this.saveVideoToAlbum(res.tempFilePath);
        } else {
          tt.hideLoading();
          this.setData({ isSaving: false });
          tt.showToast({
            title: '下载失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('下载失败:', err);
        tt.hideLoading();
        this.setData({ isSaving: false });
        tt.showToast({
          title: '下载失败',
          icon: 'none'
        });
      }
    });
  },

  // 保存视频到相册
  saveVideoToAlbum(tempFilePath) {
    tt.saveVideoToPhotosAlbum({
      filePath: tempFilePath,
      success: (res) => {
        console.log('保存到相册成功:', res);
        tt.hideLoading();
        this.setData({ isSaving: false });
        
        tt.showToast({
          title: '保存成功',
          icon: 'success'
        });
      },
      fail: (err) => {
        console.error('保存到相册失败:', err);
        tt.hideLoading();
        this.setData({ isSaving: false });
        
        // 检查是否是权限问题
        if (err.errMsg && err.errMsg.includes('auth')) {
          tt.showModal({
            title: '需要权限',
            content: '需要相册权限才能保存视频，请在设置中开启',
            confirmText: '去设置',
            success: (res) => {
              if (res.confirm) {
                tt.openSetting({
                  success: (settingRes) => {
                    console.log('设置页面返回:', settingRes);
                  }
                });
              }
            }
          });
        } else {
          tt.showToast({
            title: '保存失败',
            icon: 'none'
          });
        }
      }
    });
  },

  goBack() {
    // 如果当前是全屏状态，先退出全屏
    if (this.data.isFullscreen) {
      this.videoContext.exitFullScreen();
      // 延迟返回，让全屏退出动画完成
      setTimeout(() => {
        tt.navigateBack();
      }, 300);
    } else {
      tt.navigateBack();
    }
  }
});
