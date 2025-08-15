const app = getApp();
const { requestWithAuth } = require('../../utils/request');

Page({
  data: {
    videos: [],
    isLoading: false,
    pagination: {
      page: 1,
      pageSize: 10,
      hasMore: true
    }
  },

  onLoad() {
    this.loadVideos();
  },

  loadVideos() {
    if (!this.data.pagination.hasMore || this.data.isLoading) return;
    
    this.setData({ isLoading: true });
    
    requestWithAuth({
      url: `http://110.40.183.254:8001/tasks/user/dy_1755149617_9389d4ce`,
      method: 'GET',
      data: {
        page: this.data.pagination.page,
        page_size: this.data.pagination.pageSize
      }
    }).then(res => {
      const newVideos = res.tasks.map(item => ({
        id: item.task_id,
        name: `视频_${item.created_at.split('T')[0].replace(/-/g, '')}`,
        thumbnail: item.thumbnail_url || '/images/default-cover.jpg',
        videoUrl: item.video_url,
        createTime: item.created_at,
        status: item.status
      }));

      this.setData({
        videos: [...this.data.videos, ...newVideos],
        'pagination.hasMore': res.tasks.length >= this.data.pagination.pageSize,
        'pagination.page': this.data.pagination.page + 1,
        isLoading: false
      });
    });
  },

  loadMore() {
    this.loadVideos();
  },

  previewVideo(e) {
    const url = e.currentTarget.dataset.url;
    if (!url) return;
    
    tt.showModal({
      title: '播放视频',
      content: '是否要播放此视频？',
      success(res) {
        if (res.confirm) {
          tt.navigateTo({
            url: `/pages/video-player/video-player?url=${encodeURIComponent(url)}`
          });
        }
      }
    });
  },

  goBack() {
    tt.navigateBack();
  }
});
