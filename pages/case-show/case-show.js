Page({
  data: {
    videos: [
      {
        id: 1,
        title: '案例视频1',
        url: 'https://example.com/video1.mp4',
        thumbnail: 'https://picsum.photos/200/300'
      },
      {
        id: 2,
        title: '案例视频2',
        url: 'https://example.com/video2.mp4',
        thumbnail: 'https://picsum.photos/200/300'
      },
      {
        id: 3,
        title: '案例视频3',
        url: 'https://example.com/video3.mp4',
        thumbnail: 'https://picsum.photos/200/300'
      }
    ],
    currentVideo: null,
    isPlaying: false
  },

  onLoad() {
    // 可以在这里加载远程案例数据
  },

  playVideo(e) {
    const video = e.currentTarget.dataset.video;
    this.setData({
      currentVideo: video,
      isPlaying: true
    });
  },

  onVideoEnded() {
    this.setData({ isPlaying: false });
  },

  goBack() {
    tt.navigateBack();
  }
});
