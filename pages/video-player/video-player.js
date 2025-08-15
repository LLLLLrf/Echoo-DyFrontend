Page({
  data: {
    videoUrl: '',
    isPlaying: false
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
  }
});
