App({
  globalData: {
    userInfo: null,
    isLoggedIn: false,
    sessionKey: null
  },

  onLaunch: function () {
    console.log('App Launch');
    // 检查登录状态
    this.checkLoginStatus();
  },

  onShow: function () {
    console.log('App Show');
  },

  onHide: function () {
    console.log('App Hide');
  },

  // 检查登录状态
  checkLoginStatus: function () {
    const userInfo = tt.getStorageSync('userInfo');
    const sessionKey = tt.getStorageSync('sessionKey');
    
    if (userInfo && sessionKey) {
      this.globalData.userInfo = userInfo;
      this.globalData.sessionKey = sessionKey;
      this.globalData.isLoggedIn = true;
      console.log('用户已登录:', userInfo);
    } else {
      this.globalData.isLoggedIn = false;
      console.log('用户未登录');
    }
  },

  // 用户登录
  login: function () {
    return new Promise((resolve, reject) => {
      // 检查是否支持登录
      if (!tt.login) {
        reject(new Error('当前环境不支持登录'));
        return;
      }

      tt.login({
        success: (res) => {
          console.log('登录成功:', res);
          
          if (res.code) {
            // 把code发送给后端，拿到token 存储
            
            // 获取用户信息
            this.getUserInfo().then((userInfo) => {
              // 保存登录信息
              tt.setStorageSync('sessionKey', res.code);
              tt.setStorageSync('userInfo', userInfo);
              
              // 更新全局状态
              this.globalData.userInfo = userInfo;
              this.globalData.sessionKey = res.code;
              this.globalData.isLoggedIn = true;
              
              resolve(userInfo);
            }).catch((err) => {
              reject(err);
            });
          } else {
            reject(new Error('登录失败，未获取到code'));
          }
        },
        fail: (err) => {
          console.error('登录失败:', err);
          reject(err);
        }
      });
    });
  },

  // 获取用户信息
  getUserInfo: function () {
    return new Promise((resolve, reject) => {
      // 检查是否支持获取用户信息
      if (!tt.getUserInfo) {
        // 如果不支持，使用默认用户信息
        const defaultUserInfo = {
          nickName: '用户' + Math.floor(Math.random() * 1000),
          avatarUrl: '',
          gender: 0,
          country: '',
          province: '',
          city: '',
          language: 'zh_CN'
        };
        resolve(defaultUserInfo);
        return;
      }

      tt.getUserInfo({
        success: (res) => {
          console.log('获取用户信息成功:', res);
          resolve(res.userInfo);
        },
        fail: (err) => {
          console.error('获取用户信息失败:', err);
          // 如果获取失败，使用默认用户信息
          const defaultUserInfo = {
            nickName: '用户' + Math.floor(Math.random() * 1000),
            avatarUrl: '',
            gender: 0,
            country: '',
            province: '',
            city: '',
            language: 'zh_CN'
          };
          resolve(defaultUserInfo);
        }
      });
    });
  },

  // 检查登录状态
  isUserLoggedIn: function () {
    return this.globalData.isLoggedIn;
  },

  // 获取用户信息
  getUserInfoSync: function () {
    return this.globalData.userInfo;
  },

  // 退出登录
  logout: function () {
    // 清除本地存储
    tt.removeStorageSync('userInfo');
    tt.removeStorageSync('sessionKey');
    
    // 重置全局状态
    this.globalData.userInfo = null;
    this.globalData.sessionKey = null;
    this.globalData.isLoggedIn = false;
    
    console.log('用户已退出登录');
  }
});
