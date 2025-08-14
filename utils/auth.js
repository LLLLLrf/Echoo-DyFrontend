// 登录认证工具函数

/**
 * 检查是否支持登录功能
 */
export function isLoginSupported() {
  return typeof tt !== 'undefined' && tt.login;
}

/**
 * 检查是否支持获取用户信息
 */
export function isGetUserInfoSupported() {
  return typeof tt !== 'undefined' && tt.getUserInfo;
}

/**
 * 格式化用户信息
 */
export function formatUserInfo(userInfo) {
  return {
    nickName: userInfo.nickName || '用户' + Math.floor(Math.random() * 1000),
    avatarUrl: userInfo.avatarUrl || '',
    gender: userInfo.gender || 0,
    country: userInfo.country || '',
    province: userInfo.province || '',
    city: userInfo.city || '',
    language: userInfo.language || 'zh_CN'
  };
}

/**
 * 生成默认用户信息
 */
export function generateDefaultUserInfo() {
  return {
    nickName: '用户' + Math.floor(Math.random() * 1000),
    avatarUrl: '',
    gender: 0,
    country: '',
    province: '',
    city: '',
    language: 'zh_CN'
  };
}

/**
 * 保存用户信息到本地存储
 */
export function saveUserInfo(userInfo, sessionKey) {
  try {
    tt.setStorageSync('userInfo', userInfo);
    tt.setStorageSync('sessionKey', sessionKey);
    tt.setStorageSync('loginTime', Date.now());
    return true;
  } catch (error) {
    console.error('保存用户信息失败:', error);
    return false;
  }
}

/**
 * 从本地存储获取用户信息
 */
export function getUserInfoFromStorage() {
  try {
    return {
      userInfo: tt.getStorageSync('userInfo'),
      sessionKey: tt.getStorageSync('sessionKey'),
      loginTime: tt.getStorageSync('loginTime')
    };
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return null;
  }
}

/**
 * 清除本地存储的用户信息
 */
export function clearUserInfo() {
  try {
    tt.removeStorageSync('userInfo');
    tt.removeStorageSync('sessionKey');
    tt.removeStorageSync('loginTime');
    return true;
  } catch (error) {
    console.error('清除用户信息失败:', error);
    return false;
  }
}

/**
 * 检查登录是否过期（默认7天）
 */
export function isLoginExpired(expireDays = 7) {
  const loginTime = tt.getStorageSync('loginTime');
  if (!loginTime) {
    return true;
  }
  
  const now = Date.now();
  const expireTime = loginTime + (expireDays * 24 * 60 * 60 * 1000);
  
  return now > expireTime;
}

/**
 * 显示登录提示
 */
export function showLoginTip() {
  return new Promise((resolve, reject) => {
    tt.showModal({
      title: '需要登录',
      content: '请先登录抖音账号才能使用此功能',
      confirmText: '去登录',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          resolve(true);
        } else {
          reject(new Error('用户取消登录'));
        }
      }
    });
  });
}

/**
 * 显示登录成功提示
 */
export function showLoginSuccess() {
  tt.showToast({
    title: '登录成功',
    icon: 'success'
  });
}

/**
 * 显示登录失败提示
 */
export function showLoginError(error) {
  console.error('登录失败:', error);
  
  tt.showModal({
    title: '登录失败',
    content: error.message || '登录失败，请重试',
    showCancel: false,
    confirmText: '知道了'
  });
}

/**
 * 抖音小程序登录
 */
export function miniLogin() {
  return new Promise((resolve, reject) => {
    tt.login({
      success: (res) => {
        const { code } = res;
        tt.request({
          url: 'http://110.40.183.254:8001/auth/douyin/mini-login',
          method: 'POST',
          data: { code },
          success: (response) => {
            console.log(response)
            const { login_token } = response.data;
            tt.setStorageSync('token', login_token);
            resolve(response.data);
          },
          fail: (err) => {
            reject(err);
          }
        });
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}
