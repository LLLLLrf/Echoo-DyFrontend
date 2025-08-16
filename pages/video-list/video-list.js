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

  // 分享视频
  shareVideo: function(e) {
    const video = e.currentTarget.dataset.video;
    if (!video || !video.videoUrl) {
      tt.showToast({ title: '视频信息无效', icon: 'none' });
      return;
    }

    // 使用抖音小程序的标准分享API
    tt.share({
      title: '分享这个精彩视频',
      desc: '来自小程序的推荐视频',
      path: `/pages/video-player/video-player?url=${encodeURIComponent(video.videoUrl)}`,
      imageUrl: video.thumbnail,
      success: (res) => {
        console.log('分享成功', res);
        tt.showToast({ title: '分享成功' });
      },
      fail: (err) => {
        console.error('分享失败:', err);
        tt.showToast({ title: '分享失败', icon: 'none' });
      }
    });
  },

  // 尝试分享视频
  tryShareVideo: function(video) {
    // 方式1: 使用抖音专用分享API
    if (tt.shareVideoToFriend) {
      tt.shareVideoToFriend({
        videoPath: video.videoUrl,
        title: video.name || '我的精彩视频',
        success: (res) => {
          tt.hideLoading();
          console.log('抖音分享成功:', res);
          tt.showToast({
            title: '分享成功',
            icon: 'success'
          });
        },
        fail: (err) => {
          console.error('抖音分享失败:', err);
          // 尝试方式2
          this.tryShareAppMessage(video);
        }
      });
    } else {
      // 直接尝试方式2
      this.tryShareAppMessage(video);
    }
  },

  // 方式2: 使用小程序分享
  tryShareAppMessage: function(video) {
    // 设置当前要分享的视频到全局数据
    getApp().globalData.shareVideo = video;
    
    tt.showShareMenu({
      withShareTicket: true,
      success: (res) => {
        tt.hideLoading();
        console.log('显示分享菜单成功:', res);
      },
      fail: (err) => {
        console.error('显示分享菜单失败:', err);
        tt.hideLoading();
        // 方式3: 复制链接
        this.copyVideoLink(video);
      }
    });
  },

  // 方式3: 复制视频链接
  copyVideoLink: function(video) {
    tt.setClipboardData({
      data: video.videoUrl,
      success: (res) => {
        tt.showToast({
          title: '视频链接已复制',
          icon: 'success'
        });
      },
      fail: (err) => {
        console.error('复制失败:', err);
        tt.showToast({
          title: '分享功能暂不可用',
          icon: 'none'
        });
      }
    });
  },

  // 监听分享事件
  onShareAppMessage: function(res) {
    // 从全局数据获取要分享的视频
    const video = getApp().globalData.shareVideo;
    
    if (!video) {
      return {
        title: '我的精彩视频',
        path: '/pages/index/index',
        imageUrl: ''
      };
    }

    return {
      title: video.name || '我的精彩视频',
      path: `/pages/index/index?shared=true&videoId=${video.id}`,
      imageUrl: video.thumbnail || '',
      success: (res) => {
        console.log('分享成功:', res);
        tt.showToast({
          title: '分享成功',
          icon: 'success'
        });
        // 清除全局分享数据
        getApp().globalData.shareVideo = null;
      },
      fail: (err) => {
        console.error('分享失败:', err);
        tt.showToast({
          title: '分享失败',
          icon: 'none'
        });
        // 清除全局分享数据
        getApp().globalData.shareVideo = null;
      }
    };
  },

  goBack() {
    tt.navigateBack();
  }
});
