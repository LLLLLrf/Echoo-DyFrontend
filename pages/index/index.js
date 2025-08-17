const apiConfig = require('../../config/api.js');

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
          // showPopup: true // 显示弹窗
        });
        // this.handleGetUserProfile()
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

  // 登录调用 getUserProfile
  handleGetUserProfile: function () {
    // 检查是否已登录且有用户信息
    console.log("info:",this.data.userInfo);
    console.log("islogin:",this.data.isLoggedIn);
    if (this.data.isLoggedIn && this.data.userInfo) {
      this.goToDetail();
      return;
    }

    app.login().then( ({ code }) => {
      
      this.setData({ 
        isLoading: false,
        loginCode: code,
        // showPopup: true // 显示弹窗
      });
      // this.handleGetUserProfile()
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

    app.getUserProfile().then((userInfo) => {
      const {loginCode} = this.data
      // 发送code到后端
      tt.request({
        url: 'http://110.40.183.254:8001/auth/douyin/mini-login',
        method: 'POST',
        header: {
          'Content-Type': 'application/json'
        },
        data: {
          code: loginCode
        },
        success: (res) => {
          if (res.data && res.statusCode==200) {
            const token= res.data.login_token
            const userId= res.data.user.userid
            tt.setStorageSync('token', token);
            tt.setStorageSync('userid', userId);
            console.log("token设置成功")
          } 
        },
      })
      console.log(userInfo)
      this.setData({ 
        userInfo: userInfo,
        isLoggedIn: true,
        showPopup: false
      });
      tt.showToast({
        title: '获取用户信息成功',
        icon: 'success'
      });
      this.goToDetail();
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
    // tt.navigateTo({
    //   url: '/pages/detail/detail'
    // });
    tt.switchTab({
      url: '/pages/detail/detail',
      success: (res) => {
        
      },
      fail: (res) => {
        
      },
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
