Page({
  data: {
    videos: [
      {
        id: 1,
        title: '案例视频1-《爱人错过》',
        url: 'http://110.40.183.254:9000/echoo/video/example1.mp4',
        thumbnail: 'http://110.40.183.254:9000/echoo/image/example1-first.jpg'
      },
      {
        id: 2,
        title: '案例视频2-《如果有来生》',
        url: 'http://110.40.183.254:9000/echoo/video/example2.mp4',
        thumbnail: 'http://110.40.183.254:9000/echoo/image/example2-first.jpg'
      },
      {
        id: 3,
        title: '案例视频3-《韩流混剪》',
        url: 'http://110.40.183.254:9000/echoo/video/kpop_1757923700_68520935.mp4',
        thumbnail: 'http://110.40.183.254:9000/echoo/image/example3-first.jpg'
      },
      // {
      //   id: 3,
      //   title: '案例视频3',
      //   url: 'https://example.com/video3.mp4',
      //   thumbnail: 'https://picsum.photos/200/300'
      // }
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
