const { uploadImage } = require('../../utils/upload');
const { requestWithAuth } = require('../../utils/request');

Page({
  data: {
    audioOptions: [
      { name: 'BLACKPINK-Hou you like that', value: 'blackpink' },
      { name: 'TWICE-Strategy', value: 'twice' },
      // { name: '背景音乐2', value: 'audio2' }
    ],
        // 模板信息映射表，对应 detail-entry 中的 cards 数据
    templateMap: {
      1: {
        title: '赛博霓虹',
        cover: 'http://110.40.183.254:9000/echoo/image/nihong.png',
        color: '#ffffff'
      },
      2: {
        title: '合拍挑战',
        cover: 'http://110.40.183.254:9000/echoo/image/hepai.jpg',
        color: '#000000'
      },
      3: {
        title: '奇幻穿越',
        cover: 'http://110.40.183.254:9000/echoo/image/halibote.png',
        color: '#ffffff'
      },
      4: {
        title: '故事MV',
        cover: 'http://110.40.183.254:9000/echoo/image/example2-first.jpg',
        color: '#000000'
      },
      5: {
        title: '夏日海滩',
        cover: '/images/button_bg/cdplayer.jpg',
        color: '#ffffff'
      },
      6: {
        title: '城市夜景',
        cover: '/images/button_bg/concert.jpg',
        color: '#000000'
      },
      7: {
        title: '森林徒步',
        cover: '/images/button_bg/people.jpg',
        color: '#ffffff'
      },
      8: {
        title: '星空延时',
        cover: '/images/button_bg/guitar.jpg',
        color: '#000000'
      }
    },
    portraitPreview: null,
    selectedAudioName: null,
    inputText: '',
    currentTemplate: null // 当前选中的模板信息
  },

  onLoad(options) {
    const templateId = options.templateId || '1';
    const currentTemplate = this.data.templateMap[templateId];
    
    this.setData({ 
      templateId: templateId,
      currentTemplate: currentTemplate || { title: '未知模板', cover: '' },
      loading: false
    }, () => {
      console.log('当前模板ID:', this.data.templateId);
      console.log('当前模板信息:', this.data.currentTemplate);
      // 这里可以添加根据ID加载数据的逻辑
    });
  },

  // 示例：加载模板数据的方法
  loadTemplateData() {
    if (!this.data.templateId) return;
    
    tt.showLoading({ title: '加载中...' });
    // 这里替换为实际API请求
    setTimeout(() => {
      console.log(`加载模板${this.data.templateId}的数据`);
      tt.hideLoading();
    }, 1000);
  },

  // 根据模板ID获取模板信息
  getTemplateInfo(templateId) {
    return this.data.templateMap[templateId] || { title: '未知模板', cover: '' };
  },

  // 获取当前模板标题
  getCurrentTemplateTitle() {
    return this.data.currentTemplate ? this.data.currentTemplate.title : '未知模板';
  },

  // 获取当前模板封面
  getCurrentTemplateCover() {
    return this.data.currentTemplate ? this.data.currentTemplate.cover : '';
  },

  // 上传人像
  uploadPortrait() {
    tt.chooseImage({
      count: 1,
      success: (res) => {
        this.setData({
          portraitPreview: res.tempFilePaths[0]
        });
      }
    });
  },

  // 选择音频
  handleAudioChange(e) {
    const index = e.detail.value;
    this.setData({
      selectedAudioName: this.data.audioOptions[index].name
    });
  },

  // 输入文本
  handleTextInput(e) {
    this.setData({ inputText: e.detail.value });
  },

  submit(){
    uploadImage({
      url: 'http://110.40.183.254:8001/files/upload/image',
      name: 'file',
      filePath: this.data.portraitPreview,
      formData: { priority: '0' }
    })
    .then((imageRes) => {
      console.log("上传图片成功")
      console.log(imageRes)
      const imageUrl = imageRes.data.file_url;
      
      // 请求生成视频
      return requestWithAuth({
        url: "http://localhost:8001/tasks/video",
        method: 'POST',
        data: {
          image_files: [imageUrl],
          audio_files: [],
          template_id: 1 ,
          input_params: {
            'music':'blackpink',
            'clothes':this.data.inputText
          }
        }
      });
    })
    .then((videoRes) => {
      console.log(videoRes)
      if(videoRes.message=="任务创建成功")
        {
          tt.hideLoading();
          tt.showToast({ title: '任务创建成功！', icon: 'success' });

          // 恢复默认状态
          // this.resetToDefault();
        }
    })
    .catch((err) => {
      console.error('上传失败:', err);
      this.handleError(err.message || '上传失败，请重试');
    })
    .finally(() => {
      // 确保loading状态被重置
      this.setData({ isLoading: false });
    });
  }
});
