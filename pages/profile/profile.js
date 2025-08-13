const app = getApp();

Page({
  data: {
    userInfo: {
      avatar: '',
      nickname: '用户昵称',
      userId: 'user123'
    },
    statistics: {
      totalVideos: 0,
      totalSize: '0 MB',
      todayVideos: 0
    },
    recentVideos: [],
    isLoading: false,
    isLoggedIn: false
  },

  onLoad: function (options) {
    console.log('我的页面加载完成');
    this.checkLoginStatus();
    this.loadUserInfo();
    this.loadStatistics();
    this.loadRecentVideos();
  },

  onShow: function () {
    // 页面显示时刷新数据
    this.checkLoginStatus();
    this.loadStatistics();
    this.loadRecentVideos();
  },

  // 检查登录状态
  checkLoginStatus: function () {
    const isLoggedIn = app.isUserLoggedIn();
    const userInfo = app.getUserInfoSync();
    
    this.setData({
      isLoggedIn: isLoggedIn,
      userInfo: userInfo || this.data.userInfo
    });

    // 如果未登录，跳转到首页
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

  // 加载用户信息
  loadUserInfo: function () {
    // 优先使用全局登录信息
    const globalUserInfo = app.getUserInfoSync();
    if (globalUserInfo) {
      this.setData({
        userInfo: {
          avatar: globalUserInfo.avatarUrl || '',
          nickname: globalUserInfo.nickName || '用户昵称',
          userId: globalUserInfo.nickName || 'user123'
        }
      });
    } else {
      // 从本地存储获取用户信息
      const userInfo = tt.getStorageSync('userInfo');
      if (userInfo) {
        this.setData({
          userInfo: {
            avatar: userInfo.avatarUrl || '',
            nickname: userInfo.nickName || '用户昵称',
            userId: userInfo.nickName || 'user123'
          }
        });
      }
    }
  },

  // 加载统计数据
  loadStatistics: function () {
    // 从本地存储获取统计数据
    const statistics = tt.getStorageSync('statistics') || {
      totalVideos: 0,
      totalSize: '0 MB',
      todayVideos: 0
    };
    
    this.setData({
      statistics: statistics
    });
  },

  // 加载最近视频
  loadRecentVideos: function () {
    const recentVideos = tt.getStorageSync('recentVideos') || [];
    this.setData({
      recentVideos: recentVideos.slice(0, 5) // 只显示最近5个
    });
  },

  // 编辑用户信息
  editProfile: function () {
    tt.showModal({
      title: '编辑资料',
      content: '是否要编辑个人资料？',
      success: (res) => {
        if (res.confirm) {
          // 这里可以跳转到编辑页面或显示编辑弹窗
          tt.showToast({
            title: '功能开发中',
            icon: 'none'
          });
        }
      }
    });
  },

  // 查看所有视频
  viewAllVideos: function () {
    tt.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  // 查看视频详情
  viewVideoDetail: function (e) {
    const videoId = e.currentTarget.dataset.id;
    tt.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  // 删除视频
  deleteVideo: function (e) {
    const videoId = e.currentTarget.dataset.id;
    const videoName = e.currentTarget.dataset.name;
    
    tt.showModal({
      title: '删除视频',
      content: `确定要删除视频"${videoName}"吗？`,
      success: (res) => {
        if (res.confirm) {
          this.confirmDeleteVideo(videoId);
        }
      }
    });
  },

  // 确认删除视频
  confirmDeleteVideo: function (videoId) {
    // 从本地存储中删除视频记录
    let recentVideos = tt.getStorageSync('recentVideos') || [];
    recentVideos = recentVideos.filter(video => video.id !== videoId);
    tt.setStorageSync('recentVideos', recentVideos);
    
    // 更新统计数据
    let statistics = tt.getStorageSync('statistics') || this.data.statistics;
    statistics.totalVideos = Math.max(0, statistics.totalVideos - 1);
    tt.setStorageSync('statistics', statistics);
    
    // 刷新页面数据
    this.loadRecentVideos();
    this.loadStatistics();
    
    tt.showToast({
      title: '删除成功',
      icon: 'success'
    });
  },

  // 分享应用
  shareApp: function () {
    tt.showShareMenu({
      withShareTicket: true,
      success: () => {
        tt.showToast({
          title: '分享功能已开启',
          icon: 'success'
        });
      }
    });
  },

  // 意见反馈
  feedback: function () {
    tt.showModal({
      title: '意见反馈',
      content: '如有问题或建议，请联系我们',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 关于我们
  aboutUs: function () {
    tt.showModal({
      title: '关于Echoo',
      content: '版本：1.0.0\n一个简单易用的图片音频合成视频工具',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 清除缓存
  clearCache: function () {
    tt.showModal({
      title: '清除缓存',
      content: '确定要清除所有缓存数据吗？',
      success: (res) => {
        if (res.confirm) {
          this.confirmClearCache();
        }
      }
    });
  },

  // 确认清除缓存
  confirmClearCache: function () {
    // 清除本地存储
    tt.clearStorageSync();
    
    // 重置页面数据
    this.setData({
      statistics: {
        totalVideos: 0,
        totalSize: '0 MB',
        todayVideos: 0
      },
      recentVideos: []
    });
    
    tt.showToast({
      title: '缓存已清除',
      icon: 'success'
    });
  },

  // 设置
  goToSettings: function () {
    tt.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  // 退出登录
  logout: function () {
    tt.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          this.confirmLogout();
        }
      }
    });
  },

  // 确认退出登录
  confirmLogout: function () {
    // 调用全局退出登录方法
    app.logout();
    
    // 重置页面数据
    this.setData({
      userInfo: {
        avatar: '',
        nickname: '用户昵称',
        userId: 'user123'
      },
      isLoggedIn: false
    });
    
    tt.showToast({
      title: '已退出登录',
      icon: 'success'
    });
    
    // 返回首页
    setTimeout(() => {
      tt.navigateBack();
    }, 1000);
  },

  // 导航切换事件处理
  onNavChange: function (e) {
    const { key } = e.detail;
    console.log('导航切换到:', key);
    
    if (key === 'detail') {
      // 跳转到制作页面
      tt.navigateTo({
        url: '/pages/detail/detail'
      });
    }
  }
}); 