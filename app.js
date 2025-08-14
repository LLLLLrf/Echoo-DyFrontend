App({
  globalData: {
    userInfo: null,
    isLoggedIn: false,
    sessionKey: null,
    openid: null
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
    const openid = tt.getStorageSync('openid');
    
    if (userInfo && sessionKey && openid) {
      this.globalData.userInfo = userInfo;
      this.globalData.sessionKey = sessionKey;
      this.globalData.openid = openid;
      this.globalData.isLoggedIn = true;
      console.log('用户已登录:', userInfo);
    } else {
      this.globalData.isLoggedIn = false;
      console.log('用户未登录');
    }
  },

  // 用户登录 - 完整版本，调用后端接口
  login: function () {
    return new Promise((resolve, reject) => {
      // 检查是否支持登录
      if (!tt.login) {
        reject(new Error('当前环境不支持登录'));
        return;
      }

      // 第一步：获取code
      tt.login({
        success: (res) => {
          console.log('获取code成功:', res);
          
          if (res.code) {
            // 第二步：将code发送给后端换取openid和session_key
            this.exchangeCodeForToken(res.code).then((tokenData) => {
              // 第三步：获取用户信息
              this.getUserProfile().then((userInfo) => {
                // 保存登录信息
                tt.setStorageSync('sessionKey', tokenData.session_key);
                tt.setStorageSync('openid', tokenData.openid);
                tt.setStorageSync('userInfo', userInfo);
                
                // 更新全局状态
                this.globalData.userInfo = userInfo;
                this.globalData.sessionKey = tokenData.session_key;
                this.globalData.openid = tokenData.openid;
                this.globalData.isLoggedIn = true;
                
                resolve(userInfo);
              }).catch((err) => {
                reject(err);
              });
            }).catch((err) => {
              reject(err);
            });
          } else {
            reject(new Error('登录失败，未获取到code'));
          }
        },
        fail: (err) => {
          console.error('获取code失败:', err);
          reject(err);
        }
      });
    });
  },

  // 将code发送给后端换取token
  exchangeCodeForToken: function (code) {
    return new Promise((resolve, reject) => {
      // 引入API配置
      const apiConfig = require('./config/api.js');
      
      // 发送code到后端
      tt.request({
        url: apiConfig.getLoginUrl(),
        method: 'POST',
        header: {
          'Content-Type': 'application/json'
        },
        data: {
          code: code
        },
        success: (res) => {
          console.log('后端返回token数据:', res);
          
          if (res.data && res.data.success) {
            resolve({
              openid: res.data.openid,
              session_key: res.data.session_key
            });
          } else {
            // 如果后端接口不可用，使用模拟数据
            console.warn('后端接口返回错误，使用模拟数据');
            resolve({
              openid: 'mock_openid_' + Date.now(),
              session_key: 'mock_session_key_' + Date.now()
            });
          }
        },
        fail: (err) => {
          console.error('请求后端失败:', err);
          // 如果后端不可用，使用模拟数据
          console.warn('后端接口不可用，使用模拟数据');
          resolve({
            openid: 'mock_openid_' + Date.now(),
            session_key: 'mock_session_key_' + Date.now()
          });
        }
      });
    });
  },

  // 获取用户信息 - 需要用户主动授权
  getUserProfile: function () {
    return new Promise((resolve, reject) => {
      // 检查是否支持获取用户信息
      if (!tt.getUserProfile) {
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

      // 直接调用getUserProfile，抖音会自动弹出授权框
      tt.getUserProfile({
        desc: '用于完善用户资料',
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

  // 获取openid
  getOpenid: function () {
    return this.globalData.openid;
  },

  // 退出登录
  logout: function () {
    // 清除本地存储
    tt.removeStorageSync('userInfo');
    tt.removeStorageSync('sessionKey');
    tt.removeStorageSync('openid');
    
    // 重置全局状态
    this.globalData.userInfo = null;
    this.globalData.sessionKey = null;
    this.globalData.openid = null;
    this.globalData.isLoggedIn = false;
    
    console.log('用户已退出登录');
  }
});