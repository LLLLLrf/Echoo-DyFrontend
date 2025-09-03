const app = getApp();
const { requestWithAuth } = require('../../utils/request');
const { uploadImage } = require('../../utils/upload');
const DEFAULT_COUNT_DOWN = 60000;
let cdtimer;

Page({
  data: {
    // 文件路径
    imagePath: '',
    audioPath: '',
    videoPath: '',
    recordFilePath: '',
    
    // 默认文件路径
    defaultImagePath: 'http://110.40.183.254:9000/echoo/image/japan.jpg',
    defaultAudioPath: 'http://110.40.183.254:9000/echoo/video/xiaoyu.mp4', // 这里需要放置默认视频文件路径
    
    // 文件信息
    imageInfo: null,
    audioInfo: null,
    
    // 状态控制
    isLoading: false,
    isRecording: false,
    isPaused: false,
    showImagePicker: true,
    showAudioPicker: true,
    
    // 录音相关
    cd: DEFAULT_COUNT_DOWN,
    recordOption: {
      duration: DEFAULT_COUNT_DOWN,
      sampleRate: 16000,
      encodeBitRate: 48000,
      numberOfChannels: 2,
      format: 'aac',
      frameSize: 100
    },
    
    // 用户信息
    isLoggedIn: false,
    userInfo: null,
    currentPage: 'detail'
  },

  onLoad: function (options) {
    // // 初始化录音管理器
    // this.recorderManager = tt.getRecorderManager();
    
    // // 设置录音事件监听
    // this.recorderManager.onStart(() => {
    //   this.setData({
    //     isRecording: true,
    //     recordFilePath: '',
    //     isPaused: false
    //   });
    //   this.startCountDown();
    // });
    
    // this.recorderManager.onResume(() => {
    //   this.setData({
    //     isRecording: true,
    //     isPaused: false
    //   });
    //   this.continueCountDown();
    // });
    
    // this.recorderManager.onPause(() => {
    //   this.setData({
    //     isRecording: false,
    //     isPaused: true
    //   });
    //   this.pauseCountDown();
    // });
    
    // this.recorderManager.onStop(({ tempFilePath }) => {
    //   this.setData({
    //     isRecording: false,
    //     isPaused: false,
    //     recordFilePath: tempFilePath,
    //     audioPath: tempFilePath,  // 录音文件作为音频源
    //     audioInfo: {
    //       name: '录音文件',
    //       size: this.formatFileSize(tempFilePath.size || 0)
    //     },
    //     showAudioPicker: false
    //   });
    //   this.stopCountDown();
    //   tt.showToast({ title: '录音结束' });
    // });
    
    // this.recorderManager.onError(err => {
    //   console.error('录音错误:', err);
    //   tt.showToast({ title: '录音失败', icon: 'none' });
    // });
    
    // // 检查登录状态
    // this.checkLoginStatus();
  },

  onUnload: function() {
    this.stopRecording();
    clearInterval(cdtimer);
  },

  onShow: function () {
    this.checkLoginStatus();
  },

  // ========== 录音控制 ==========
  startRecording: function() {
    if (this.data.isRecording) {
      tt.showToast({ title: '正在录音' });
      return;
    }
    this.recorderManager.start(this.data.recordOption);
  },

  pauseOrResumeRecording: function() {
    if (this.data.isPaused) {
      this.recorderManager.resume();
    } else {
      this.recorderManager.pause();
    }
  },

  stopRecording: function() {
    this.recorderManager.stop();
  },

  // ========== 倒计时控制 ==========
  startCountDown: function() {
    this.setData({ cd: DEFAULT_COUNT_DOWN });
    clearInterval(cdtimer);
    cdtimer = setInterval(() => {
      this.setData({ cd: this.data.cd - 100 });
    }, 100);
  },

  pauseCountDown: function() {
    clearInterval(cdtimer);
  },

  continueCountDown: function() {
    clearInterval(cdtimer);
    cdtimer = setInterval(() => {
      this.setData({ cd: this.data.cd - 100 });
    }, 100);
  },

  stopCountDown: function() {
    clearInterval(cdtimer);
    this.setData({ cd: DEFAULT_COUNT_DOWN });
  },

  // ========== 登录检查 ==========
  checkLoginStatus: function () {
    const isLoggedIn = app.isUserLoggedIn();
    const userInfo = app.getUserInfoSync();
    
    this.setData({
      isLoggedIn: isLoggedIn,
      userInfo: userInfo
    });

    if (!isLoggedIn) {
      tt.showModal({
        title: '需要登录',
        content: '请先登录抖音账号',
        showCancel: false,
        success: () => {
          tt.navigateBack();
        }
      });
    }
  },

  // ========== 文件选择 ==========
  chooseImage: function () {
    if (!this.checkLogin()) return;

    tt.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success: (res) => {
        const imagePath = res.tempFilePaths[0];
        
        tt.getImageInfo({
          src: imagePath,
          success: (imageInfo) => {
        this.setData({
              imagePath: imagePath,
              imageInfo: {
                width: imageInfo.width,
                height: imageInfo.height,
                size: imageInfo.size || '未知'
              },
              showImagePicker: false
            });
            tt.showToast({ title: '图片选择成功', icon: 'success' });
          },
          fail: (err) => {
            this.setData({ imagePath: imagePath, imageInfo: null });
          }
        });
      },
      fail: (err) => {
        console.error('选择图片失败:', err);
        tt.showToast({ title: '选择图片失败', icon: 'none' });
      }
    });
  },

  useDefaultImage: function() {
    if (!this.checkLogin()) return;

    const imagePath = this.data.defaultImagePath;
    
    tt.getImageInfo({
      src: imagePath,
      success: (imageInfo) => {
        this.setData({
          imagePath: imagePath,
          imageInfo: {
            width: imageInfo.width,
            height: imageInfo.height,
            size: imageInfo.size || '未知'
          },
          showImagePicker: false
        });
        tt.showToast({ title: '已选择默认图片', icon: 'success' });
      },
      fail: (err) => {
        console.error('获取默认图片信息失败:', err);
        this.setData({ 
          imagePath: imagePath, 
          imageInfo: {
            width: 320,
            height: 320,
            size: '未知'
          },
          showImagePicker: false
        });
        tt.showToast({ title: '已选择默认图片', icon: 'success' });
      }
    });
  },

  chooseAudio: function () {
    if (!this.checkLogin()) return;

    tt.chooseMedia({
      count: 1,
      mediaType: ['video'],
      sourceType: ['album'],
      success: (res) => {
        const tempFiles = res.tempFiles;
        if (tempFiles && tempFiles.length > 0) {
          const audioFile = tempFiles[0];
          
          if (audioFile.size > 50 * 1024 * 1024) {
            tt.showToast({ title: '文件过大，请选择小于50MB的文件', icon: 'none' });
            return;
          }

        this.setData({
            audioPath: audioFile.tempFilePath,
            recordFilePath: '', // 清除录音文件
            audioInfo: {
              name: audioFile.name || '未命名',
              size: this.formatFileSize(audioFile.size)
            },
            showAudioPicker: false
          });
          
          tt.showToast({ title: '文件选择成功', icon: 'success' });
        }
      },
      fail: (err) => {
        console.error('选择文件失败:', err);
        tt.showToast({ title: '选择文件失败', icon: 'none' });
      }
    });
  },

  useDefaultAudio: function() {
    if (!this.checkLogin()) return;

    // 这里需要替换为实际的默认视频文件路径
    // 可以是网络地址或本地文件
    const defaultAudioUrl = 'http://110.40.183.254:9000/echoo/video/xiaoyu.mp4'; // 示例网络音频
    
    this.setData({
      audioPath: defaultAudioUrl,
      recordFilePath: '', // 清除录音文件
      audioInfo: {
        name: '默认音频文件',
        size: '未知'
      },
      showAudioPicker: false
    });
    
    tt.showToast({ title: '已选择默认音频', icon: 'success' });
  },

  // ========== 文件处理 ==========
  uploadFiles: function () {
    console.log(111)
    // if (!this.checkLogin()) return;
    
    if (!this.data.imagePath) {
      tt.showToast({ title: '请先选择图片', icon: 'none' });
      return;
    }
    
    // 使用录音文件或选择的音频文件
    const audioSource = this.data.recordFilePath || this.data.audioPath;
    if (!audioSource) {
      tt.showToast({ title: '请先选择音频或录制声音', icon: 'none' });
      return;
    }

    this.setData({ isLoading: true });
    tt.showLoading({ title: '正在处理...', mask: true });

    // 这里做一个判断是否使用默认
    if (this.data.imagePath === this.data.defaultImagePath) {
      requestWithAuth({
        url: "http://110.40.183.254:8001/tasks/video",
        method: 'POST',
        data: {
          image_files: [this.data.defaultImagePath],
          audio_files: [this.data.defaultAudioPath]
        }
      }).then((videoRes) => {
      console.log(videoRes)
      if(videoRes.message=="任务创建成功")
        {
          tt.hideLoading();
          tt.showToast({ title: '任务创建成功！', icon: 'success' });

          // 恢复默认状态
          this.resetToDefault();
        }
    })
    }
    else {
    // 上传图片
    uploadImage({
      url: 'http://110.40.183.254:8001/files/upload/image',
      name: 'file',
      filePath: this.data.imagePath,
      formData: { priority: '0' }
    })
    .then((imageRes) => {
      console.log("上传图片成功")
      console.log(imageRes)
      const imageUrl = imageRes.data.file_url;
      
      // 上传音频
      return uploadImage({
        url: 'http://110.40.183.254:8001/files/upload/audio',
        name: 'file',
        filePath: audioSource,
        formData: { priority: '0' }
      })
      .then((audioRes) => {
        console.log("上传音频成功")
        const audioUrl = audioRes.data.file_url;
        return { imageUrl, audioUrl };
      });
    })
    .then(({ imageUrl, audioUrl }) => {
      // 请求生成视频
      return requestWithAuth({
        url: "http://110.40.183.254:8001/tasks/video",
        method: 'POST',
        data: {
          image_files: [imageUrl],
          audio_files: [audioUrl]
        }
      });
    })
    .then((videoRes) => {
      console.log(videoRes)
      if(videoRes.message=="任务创建成功")
        {
          tt.hideLoading();
          tt.showToast({ title: '任务创建成功！', icon: 'success' });

          // 恢复默认状态
          this.resetToDefault();
        }
    })
    .catch((err) => {
      console.error('上传失败:', err);
      this.handleError(err.message || '上传失败，请重试');
    })
    .finally(() => {
      // 确保loading状态被重置
      this.setData({ isLoading: false });
    });
  }
  },

  // ========== 重置状态 ==========
  resetToDefault: function() {
    this.setData({
      // 清除文件路径
      imagePath: '',
      audioPath: '',
      videoPath: '',
      recordFilePath: '',
      
      // 清除文件信息
      imageInfo: null,
      audioInfo: null,
      
      // 重置状态控制
      isLoading: false,
      showImagePicker: true,
      showAudioPicker: true,
      
      // 重置录音状态
      isRecording: false,
      isPaused: false,
      cd: DEFAULT_COUNT_DOWN
    });
    
    // 停止录音相关定时器
    this.stopCountDown();
  },

  downloadVideo: function (videoUrl, taskId) {
        tt.downloadFile({
          url: videoUrl,
          success: (downloadRes) => {
        tt.hideLoading();
            this.setData({
              videoPath: downloadRes.tempFilePath,
              isLoading: false
            });
        
        this.saveVideoRecord(downloadRes.tempFilePath, taskId);
        tt.showToast({ title: '视频生成成功！', icon: 'success' });
      },
      fail: (err) => {
        console.error('下载视频失败:', err);
        this.handleError('视频下载失败');
      }
            });
          },

  saveVideoRecord: function (videoPath, taskId) {
    const videoRecord = {
      id: taskId || Date.now().toString(),
      name: `视频_${new Date().toLocaleDateString()}`,
      path: videoPath,
      createTime: new Date().toLocaleString(),
      size: '未知',
      thumbnail: this.data.imagePath,
      userId: this.data.userInfo?.nickName || 'unknown'
    };

    let recentVideos = tt.getStorageSync('recentVideos') || [];
    recentVideos.unshift(videoRecord);
    if (recentVideos.length > 20) recentVideos = recentVideos.slice(0, 20);
    tt.setStorageSync('recentVideos', recentVideos);
    
    this.updateStatistics();
  },

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

  // ========== 辅助函数 ==========
  checkLogin: function() {
    if (!this.data.isLoggedIn) {
      tt.showToast({ title: '请先登录', icon: 'none' });
      return false;
    }
    return true;
  },

  handleError: function (message) {
    tt.hideLoading();
            this.setData({ isLoading: false });
    tt.showToast({ title: message, icon: 'none' });
  },

  formatFileSize: function (bytes) {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]);
  },

  // ========== UI操作 ==========
  previewImage: function () {
    if (this.data.imagePath) {
      tt.previewImage({
        urls: [this.data.imagePath],
        current: this.data.imagePath
      });
    }
  },

  playAudio: function () {
    const audioSource = this.data.recordFilePath || this.data.audioPath;
    console.log(audioSource)
    if (audioSource) {
      // const audioContext = tt.createInnerAudioContext();
      // audioContext.src = audioSource;
      // audioContext.play();

      const bgam = tt.getBackgroundAudioManager();
      bgam.src = audioSource;
      bgam.play()
    }
  },

  saveVideoToAlbum: function () {
    if (!this.data.videoPath) {
      tt.showToast({ title: '没有可保存的视频', icon: 'none' });
      return;
    }

    tt.saveVideoToPhotosAlbum({
      filePath: this.data.videoPath,
      success: () => {
        tt.showToast({ title: '视频已保存到相册', icon: 'success' });
      },
      fail: (err) => {
        console.error('保存视频失败:', err);
        tt.showToast({ title: '保存失败，请检查权限', icon: 'none' });
      }
    });
  },

  removeImage: function() {
    this.setData({
      imagePath: '',
      imageInfo: null,
      showImagePicker: true
    });
  },

  removeAudio: function() {
    this.setData({
      audioPath: '',
      recordFilePath: '',
      audioInfo: null,
      showAudioPicker: true
    });
  },

  onNavChange: function (e) {
    const { key } = e.detail;
    if (key === 'profile') {
      tt.navigateTo({ url: '/pages/profile/profile' });
    }
  }
});