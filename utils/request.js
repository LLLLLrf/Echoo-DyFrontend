/**
 * 封装带认证头的请求方法
 * @param {Object} options 请求配置
 */
export function requestWithAuth(options) {
//   const token = tt.getStorageSync('token');
//   if (!token) {
//     return Promise.reject(new Error('未登录，请先登录'));
//   }
  const token = "token_dy_1755149617_9389d4ce_1755150511_a7ec6241086aaaa0"
  const { url, method, data, header = {} } = options;
  return new Promise((resolve, reject) => {
    tt.request({
      url,
      method,
      data,
      header: {
        ...header,
        Authorization: `Bearer ${token}`
      },
      success: (res) => {
        resolve(res.data);
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

/**
 * 上传图片
 * @param {Object} options 上传配置
 * @param {string} options.url 上传地址
 * @param {string} options.filePath 图片路径
 * @param {string} options.name 表单字段名
 * @param {Object} options.formData 附加表单数据
 */
export function uploadImage(options) {
//   const token = tt.getStorageSync('login_token');
//   if (!token) {
//     return Promise.reject(new Error('未登录，请先登录'));
//   }

// 调试时暂时写死token
   const token = "token_dy_1755149617_9389d4ce_1755150511_a7ec6241086aaaa0"

  return new Promise((resolve, reject) => {
    tt.uploadFile({
      url: options.url,
      filePath: options.filePath,
      name: options.name || 'images',
      header: {
        Authorization: `Bearer ${token}`
      },
      formData: options.formData || {},
      success: (response) => {
        resolve(JSON.parse(response.data));
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

/**
 * 上传图片
 * @param {Object} options 上传配置
 * @param {string} options.url 上传地址
 * @param {string} options.filePath 图片路径
 * @param {string} options.name 表单字段名
 * @param {Object} options.formData 附加表单数据
 */
export function uploadImage(options) {
//   const token = tt.getStorageSync('login_token');
//   if (!token) {
//     return Promise.reject(new Error('未登录，请先登录'));
//   }

// 调试时暂时写死token
   const token = "token_dy_1755149617_9389d4ce_1755150511_a7ec6241086aaaa0"

  return new Promise((resolve, reject) => {
    tt.uploadFile({
      url: options.url,
      filePath: options.filePath,
      name: options.name || 'images',
      header: {
        Authorization: `Bearer ${token}`
      },
      formData: options.formData || {},
      success: (response) => {
        resolve(JSON.parse(response.data));
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}
