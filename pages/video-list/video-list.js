const app = getApp();
const { requestWithAuth } = require('../../utils/request');

Page({
  data: {
    videos: [],
    isLoading: false,
    pagination: {
      page: 1,
      pageSize: 5,
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
        thumbnail: 'https://p9-aiop-sign.byteimg.com/tos-cn-i-vuqhorh59i/20250816004616E1B398AA7CE0DE2B6548-4293-0~tplv-vuqhorh59i-image.image?rk3s=7f9e702d&x-expires=1755362776&x-signature=%2BqvS%2FivVSkPxHMfTC95y7TX1mOo%3D',
        videoUrl: 'http://110.40.183.254:9000/echoo/video/0814.mp4',
        createTime: item.created_at,
        status: item.status
      }));

      this.setData({
        videos: [...this.data.videos, ...newVideos],
        'pagination.hasMore': res.tasks.length >= this.data.pagination.pageSize,
        'pagination.page': this.data.pagination.page + 1,
        isLoading: false
      });
    }).catch(err => {
      console.error('加载失败:', err);
      this.setData({ isLoading: false });
      tt.showToast({ title: '加载失败', icon: 'none' });
    });
  },

  onReachBottom() {
    this.loadVideos();
  },

  previewVideo: function(e) {
    const url = e.currentTarget.dataset.url;
    if (!url) {
      tt.showToast({
        title: '视频地址无效',
        icon: 'none'
      });
      return;
    }

    tt.navigateTo({
      url: `/pages/video-player/video-player?url=${encodeURIComponent(url)}`,
      success: () => console.log('跳转播放页成功'),
      fail: (err) => {
        console.error('跳转失败:', err);
        tt.showToast({
          title: '播放失败',
          icon: 'none'
        });
      }
    });
  },

  goBack() {
    tt.navigateBack();
  }
});
