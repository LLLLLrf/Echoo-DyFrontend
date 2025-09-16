Page({
  data: {
    videoUrl: '',
    isPlaying: true,
    videoPath:'',
  },

  async onUploadDouyinVideo(uploadOptions) {
    // 通过 uploadOptions 可以拿到 button target 上的一些信息
    // 如这里的 demo 可以拿到 id: "1"，hello: "world"
    console.log("onUploadDouyinVideoOptions: ", uploadOptions);

    tt.showLoading({ title: '下载视频中...', mask: true });
    // 先下载
    

    // 可以利用异步能力配合其他 API 获取必要的字段信息
    // const videoPath = await this.chooseVideo();

    const videoPath = await this.downloadVideo(this.data.videoUrl);
    
    console.log("videoPath:", videoPath);
    // 返回值（文档中称之为 uploadParams）将被当作发布参数传入视频发布器，发布视频
    return {
      videoPath,
      stickersConfig: {
        text: [
          // {
          //   text: "这是文字贴图",
          //   color: "#ffffff",
          //   fontSize: 28,
          //   scale: 1,
          //   x: 0.5,
          //   y: 0.5,
          // },
        ],
      },
      success: function (callback) {
        // 只有当发布成功且挂载成功时，success callback 才会有 videoId
        console.log("success: ", callback);
      },
      fail: function (callback) {
        console.log("fail: ", callback);
      },
      complete: function (callback) {
        console.log("complete: ", callback);
      },
    };
  },

  onLoad(options) {
    this.setData({
      videoUrl: decodeURIComponent(options.url)
    });
  },

  onReady() {
    this.videoContext = tt.createVideoContext('myVideo');
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

  goBack() {
    tt.navigateBack();
  },

  chooseVideo() {
    return new Promise((resolve) => {
      tt.chooseVideo({
        sourceType: ["album"],
        compressed: true,
        success: (res) => {
          resolve(res.tempFilePath);
        },
        fail: (err) => {
          let errType = err.errMsg.includes("chooseVideo:fail cancel")
            ? "取消选择"
            : "选择失败";
          tt.showModal({
            title: errType,
            content: err.errMsg,
            showCancel: false,
          });
          resolve("");
        },
      });
    });
  },
  downloadVideo(videoUrl) {
    return new Promise((resolve, reject) => {
      tt.downloadFile({
        url: videoUrl,
        success: (downloadRes) => {
          console.log("视频下载成功");
          console.log(downloadRes.tempFilePath);
          this.setData({
            videoPath: downloadRes.tempFilePath,
            isLoading: false
          });
          resolve(downloadRes.tempFilePath); // 必须调用 resolve
        },
        fail: (err) => {
          console.error('下载视频失败:', err);
          this.handleError('视频下载失败');
          reject(err); // 必须调用 reject
        }
      });
    });
  },
});
