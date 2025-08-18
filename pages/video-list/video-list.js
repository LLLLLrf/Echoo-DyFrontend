const app = getApp();
const { requestWithAuth } = require('../../utils/request');

Page({
  data: {
    videos: [],
    isLoading: false,
    pagination: {
      page: 1,
      pageSize: 9,
      hasMore: true
    }
  },

  onLoad() {
    this.loadVideos();
  },

  loadVideos() {
    if (!this.data.pagination.hasMore || this.data.isLoading) return;
    
    this.setData({ isLoading: true });
    const userId = tt.getStorageSync('userid');

    requestWithAuth({
      url: `http://110.40.183.254:8001/tasks/user/${userId}`,
      method: 'GET',
      data: {
        page: this.data.pagination.page,
        page_size: this.data.pagination.pageSize
      }
    }).then(res => {
        if(!(res.tasks === null)){
          const newVideos = res.tasks.map(item => ({
            id: item.task_id,
            name: `视频_${item.created_at.split('T')[0].replace(/-/g, '')}`,
            thumbnail: item.video_first_image_url,
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
        }else{ 
          this.setData({
            isLoading: false
          });
        }
    }).catch(err => {
      console.error('加载失败:', err);
      this.setData({ isLoading: false });
      // tt.showToast({ title: '加载失败', icon: 'none' });
    });
  },

  onReachBottom() {
    this.loadVideos();
  },

  previewVideo: function(e) {
    console.log("previewVideo:",e);
    const url = e.currentTarget.dataset.url;
    const status = e.currentTarget.dataset.status;
    
    // 检查视频状态
    if (status === 'error') {
      tt.showToast({
        title: '视频生成失败',
        icon: 'none'
      });
      return;
    }
    
    if (status !== 'completed') {
      tt.showToast({
        title: '视频生成中，请稍后',
        icon: 'none'
      });
      return;
    }
    
    if (!url) {
      tt.showToast({
        title: '视频地址无效',
        icon: 'none'
      });
      return;
    }

    tt.navigateTo({
      url: `/pages/video-player/video-player?url=${encodeURIComponent(url)}`,
      success: () => console.log('跳转播放页成功',url),
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
    const status = e.currentTarget.dataset.status;
    
    // 检查视频状态
    if (status === 'failed') {
      tt.showToast({
        title: '视频生成失败，无法分享',
        icon: 'none'
      });
      return;
    }
    
    if (status !== 'completed') {
      tt.showToast({
        title: '视频生成中，无法分享',
        icon: 'none'
      });
      return;
    }
    
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
  },

  navigateToDetail: function() {
    tt.switchTab({
      url: "/pages/detail/detail",
      success: (res) => {
        
      },
      fail: (res) => {
        
      },
    });
  }
});
