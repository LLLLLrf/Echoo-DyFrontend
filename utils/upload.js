
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
     timeout: 40000,
     formData: options.formData || {},
     success: (response) => {
       resolve(JSON.parse(response.data));
     },
     fail: (err) => {
       reject(err);
     }
   });
}
)
}