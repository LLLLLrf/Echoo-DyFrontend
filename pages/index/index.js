const app = getApp();

Page({
  data: {
    isLoggedIn: false,
    userInfo: null,
    isLoading: false,
    showPopup: false, // 控制弹窗显示
    loginCode: null  // 存储 login 返回的 code
  },

  onLoad: function () {
    console.log('首页加载');
    this.checkLoginStatus();
  },

  onShow: function () {
    // 页面显示时检查登录状态
    this.checkLoginStatus();
  },

  // 检查登录状态
  checkLoginStatus: function () {
    const isLoggedIn = app.isUserLoggedIn();
    const userInfo = app.getUserInfoSync();
    
    this.setData({
      isLoggedIn: isLoggedIn,
      userInfo: userInfo
    });
  },

  // 导航到详情页（带登录检查）
  navigateToDetail: function () {
    console.log("点击Start按钮");
    
    if (!this.data.isLoggedIn) {
      this.setData({ isLoading: true });
      
      app.login().then(({ code }) => {
        this.setData({ 
          isLoading: false,
          loginCode: code,
          showPopup: true // 显示弹窗
        });
      }).catch((err) => {
        this.setData({ isLoading: false });
        console.error('登录失败:', err);
        tt.showModal({
          title: '登录失败',
          content: '登录失败，请重试',
          showCancel: false,
          confirmText: '知道了'
        });
      });
    } else {
      this.goToDetail();
    }
  },

  // 关闭弹窗
  closePopup: function () {
    this.setData({ showPopup: false });
  },

  // 调用 getUserProfile
  handleGetUserProfile: function () {
    app.getUserProfile().then((userInfo) => {
      this.setData({ 
        userInfo: userInfo,
        isLoggedIn: true,
        showPopup: false
      });
      tt.showToast({
        title: '获取用户信息成功',
        icon: 'success'
      });
    }).catch((err) => {
      console.error('获取用户信息失败:', err);
      tt.showToast({
        title: '获取用户信息失败',
        icon: 'none'
      });
    });
  },

  // 登录并跳转
  loginAndNavigate: function () {
    this.setData({ isLoading: true });
    
    tt.showLoading({
      title: '正在登录...',
      mask: true
    });

    app.login().then((userInfo) => {
      tt.hideLoading();
      this.setData({ 
        isLoading: false,
        isLoggedIn: true,
        userInfo: userInfo
      });
      
      tt.showToast({
        title: '登录成功',
        icon: 'success'
      });
      
      // 登录成功后跳转
      setTimeout(() => {
        this.goToDetail();
      }, 1000);
      
    }).catch((err) => {
      tt.hideLoading();
      this.setData({ isLoading: false });
      
      console.error('登录失败:', err);
      
      tt.showModal({
        title: '登录失败',
        content: '登录失败，是否重试？',
        success: (res) => {
          if (res.confirm) {
            this.loginAndNavigate();
          }
        }
      });
    });
  },

  // 跳转到详情页
  goToDetail: function () {
    tt.navigateTo({
      url: '/pages/detail/detail'
    });
  },

  // 手动登录（可选）
  manualLogin: function () {
    if (this.data.isLoggedIn) {
      tt.showToast({
        title: '您已登录',
        icon: 'none'
      });
      return;
    }
    
    this.loginAndNavigate();
  }
});
