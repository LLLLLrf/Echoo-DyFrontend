const app = getApp();
const { uploadImage,requestWithAuth } = require('../../utils/request');
var DEFAULT_COUNT_DOWN = 60000;
var cdtimer;

Page({
  data: {
    imagePath: '',
    isLoading: false,
    cd: DEFAULT_COUNT_DOWN,
    isRecording: false,
    isPaused: false,
    recordOption: {
      duration: DEFAULT_COUNT_DOWN,
      sampleRate: 16000,
      encodeBitRate: 48000,
      numberOfChannels: 2,
      format: 'aac',
      frameSize: 100
    },
    recordFilePath: ''
  },
  startCountDown() {
    this.setData({
      cd: DEFAULT_COUNT_DOWN
    });
    clearInterval(cdtimer);
    cdtimer = setInterval(() => {
      this.setData({
        cd: this.data.cd - 100
      });
    }, 100);
  },
  pauseCountDown() {
    clearInterval(cdtimer);
  },
  continueCountDown() {
    clearInterval(cdtimer);
    cdtimer = setInterval(() => {
      this.setData({
        cd: this.data.cd - 100
      });
    }, 100);
  },
  stopCountDown() {
    clearInterval(cdtimer);
    this.setData({
      cd: DEFAULT_COUNT_DOWN
    });
  },
  onLoad: function(options) {
    this.recorderManager = tt.getRecorderManager();
    this.recorderManager.onStart(() => {
      this.setData({
        isRecording: true,
        recordFilePath: '',
        isPaused: false
      });
      this.startCountDown();
    });
    this.recorderManager.onResume(() => {
      this.setData({
        isRecording: true,
        isPaused: false
      });
      this.continueCountDown();
    });
    this.recorderManager.onPause(() => {
      this.setData({
        isRecording: false,
        isPaused: true
      });
      this.pauseCountDown();
    });
    this.recorderManager.onStop(({
      tempFilePath
    }) => {
      this.setData({
        isRecording: false,
        isPaused: false,
        recordFilePath: tempFilePath
      });
      this.stopCountDown();
      tt.showToast({
        title: '录音结束'
      });
    });
    this.recorderManager.onFrameRecorded(({
      frameBuffer,
      isLastFrame
    }) => {});
    this.recorderManager.onError(err => {
      console.error(err);
    });
  },
  onUnload: function() {
    this.stop();
    clearInterval(cdtimer);
  },
  start() {
    if (this.data.isRecording) {
      tt.showToast({
        title: '正在录音'
      });
    } else {
      this.recorderManager.start(this.data.recordOption);
    }
  },
  pauseorresume() {
    if (this.data.isPaused) {
      this.recorderManager.resume();
    } else {
      this.recorderManager.pause();
    }
  },
  stop() {
    this.recorderManager.stop();
  },
  chooseImage() {
    tt.chooseImage({
      count: 3,
      success: (res) => {
        tt.showToast({ title: "选择成功" });
        console.log("chooseImage 返回结果：", res);
        this.setData({
          imagePath: res.tempFilePaths[0],
          imageList: res.tempFiles,
        });
      },
      fail(err) {
        let errType = err.errMsg.includes("chooseImage:fail cancel")
          ? "取消选择"
          : "选择失败";
        tt.showModal({
          title: errType,
          content: err.errMsg,
          showCancel: false,
        });
      },
      complete() {
        console.log("完成选择");
      },
    });
  },
  // 上传图片
  uploadFiles: function() {
    if (!this.data.imagePath) {
      tt.showToast({
        title: '请先选择图片',
        icon: 'none'
      });
      return;
    }
    this.setData({ isLoading: true });
    uploadImage({
      // url: 'http://110.40.183.254:8001/files/upload/image',
      url: 'http://localhost:8001/files/upload/image',
      name: 'file',
      filePath: this.data.imagePath,
      formData: { priority: '0' }
    })
      .then((res) => {
        console.log(res)
        const image_url=res.data.file_url
        // 继续上传
        uploadImage({
          // url: 'http://110.40.183.254:8001/files/upload/audio',
          url: 'http://localhost:8001/files/upload/audio',
          name: 'file',
          filePath: this.data.recordFilePath,
          formData: { priority: '0' }
        })
          .then((res) => {
            console.log(res)
            const audio_url=res.data.file_url
            requestWithAuth({
              // url:"http://110.40.183.254:8001/tasks/video",
              url:"http://localhost:8001/tasks/video",
              method:'POST',
              data:{
                "image_files":[image_url],
                "audio_files":[audio_url]
              }
            }).then((res)=>{
              console.log(res)

            })
            
          })
      })
      .catch((err) => {
        console.log(err)
        tt.showModal({
          title: '上传失败',
          content: err.message || '上传失败，请重试',
          showCancel: false
        });
      })
      .finally(() => {
        this.setData({ isLoading: false });
      });
  }
});
