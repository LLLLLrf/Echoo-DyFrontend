// 请求工具函数
const app = getApp();

/**
 * 带认证的请求函数
 * @param {Object} options - 请求选项
 * @param {string} options.url - 请求URL
 * @param {string} options.method - 请求方法
 * @param {Object} options.data - 请求数据
 * @param {Object} options.header - 请求头
 */
function requestWithAuth(options) {
  const token = tt.getStorageSync('token');
  return new Promise((resolve, reject) => {
    const userInfo = app.getUserInfoSync();
    const openid = app.getOpenid();
    const defaultHeader = {
      'Content-Type': 'application/json'
    };
    const headers = { ...defaultHeader, ...options.header, Authorization: `Bearer ${token}` };

    tt.request({
      url: options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: headers,
      timeout: 40000, // 设置超时时间为10秒（默认值为6000毫秒）
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

/**
 * GET请求
 * @param {string} url - 请求URL
 * @param {Object} data - 请求参数
 * @param {Object} header - 请求头
 */
function get(url, data = {}, header = {}) {
  return requestWithAuth({
    url,
    method: 'GET',
    data,
    header
  });
}

/**
 * POST请求
 * @param {string} url - 请求URL
 * @param {Object} data - 请求数据
 * @param {Object} header - 请求头
 */
function post(url, data = {}, header = {}) {
  return requestWithAuth({
    url,
    method: 'POST',
    data,
    header
  });
}

/**
 * PUT请求
 * @param {string} url - 请求URL
 * @param {Object} data - 请求数据
 * @param {Object} header - 请求头
 */
function put(url, data = {}, header = {}) {
  return requestWithAuth({
    url,
    method: 'PUT',
    data,
    header
  });
}

/**
 * DELETE请求
 * @param {string} url - 请求URL
 * @param {Object} data - 请求数据
 * @param {Object} header - 请求头
 */
function del(url, data = {}, header = {}) {
  return requestWithAuth({
    url,
    method: 'DELETE',
    data,
    header
  });
}



module.exports = {
  requestWithAuth,
  get,
  post,
  put,
  delete: del
};
