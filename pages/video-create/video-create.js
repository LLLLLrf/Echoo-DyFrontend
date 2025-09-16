const { uploadImage } = require('../../utils/upload');
const { requestWithAuth } = require('../../utils/request');

Page({
  data: {
    // 模板信息映射表，对应 detail-entry 中的 cards 数据
    templateMap: {
      3: {
        title: '赛博霓虹',
        cover: 'http://110.40.183.254:9000/echoo/image/nihong.png',
        color: '#ffffff',
        audioOptions: [
          { name: '电音之夜', value: 'cyber_night' },
          { name: '霓虹节奏', value: 'neon_beat' }
        ]
      },
      4: {
        title: '合拍挑战',
        cover: 'http://110.40.183.254:9000/echoo/image/hepai.jpg',
        color: '#000000',
        audioOptions: [
          { name: '合拍节奏', value: 'hepai_beat' },
          { name: '双人舞曲', value: 'duet_dance' }
        ]
      },
      2: {
        title: '奇幻穿越',
        cover: 'http://110.40.183.254:9000/echoo/image/halibote.png',
        color: '#ffffff',
        audioOptions: [
          { name: '魔法序曲', value: 'magic_overture' },
          { name: '穿越幻想', value: 'fantasy_travel' }
        ]
      },
      0: {
        title: '故事MV',
        cover: 'http://110.40.183.254:9000/echoo/image/example2-first.jpg',
        color: '#000000',
        audioOptions: [
          { name: 'BLACKPINK-Hou you like that', value: 'blackpink' },
          { name: 'TWICE-Strategy', value: 'twice' }
        ]
      },
      1: {
        title: 'Kpop韩流',
        cover: 'http://110.40.183.254:9000/echoo/image/example4-first.jpg',
        color: '#000000',
        audioOptions: [
          { name: 'BLACKPINK-Hou you like that', value: 'blackpink' },
          { name: 'TWICE-Strategy', value: 'twice' }
        ]
      },
      5: {
        title: '欧美流行',
        cover: 'http://110.40.183.254:9000/echoo/image/europe-example.jpg',
        color: '#000000',
        audioOptions: [
          { name: 'JustinBieber-STAY', value: 'jb' },
        ]
      }
    },
    audioOptions: [], // 当前模板的歌曲选项
    portraitPreview: null,
    selectedAudioName: null, // 显示的音频名称
    selectedAudioValue: null, // 提交给服务器的音频值
    selectedAudioFile: null, // 存储选择的音频文件路径
    inputText: '',
    currentTemplate: null // 当前选中的模板信息
  },

  onLoad(options) {
    const templateId = options.templateId || '1';
    const currentTemplate = this.data.templateMap[templateId];
    const audioOptions = currentTemplate && currentTemplate.audioOptions ? currentTemplate.audioOptions : [];
    this.setData({ 
      templateId: templateId,
      currentTemplate: currentTemplate || { title: '未知模板', cover: '' },
      audioOptions: audioOptions,
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
      sizeType: ['compressed'],
      sourceType: ['album'],
      success: (res) => {
        this.setData({
          portraitPreview: res.tempFilePaths[0]
        });
      }
    });
  },

  // 选择音频文件（当templateId为0时使用）
  chooseAudio() {
    tt.chooseMedia({
      count: 1,
      mediaType: ['video'],
      sourceType: ['album'],
      success: (res) => {
        const tempFiles = res.tempFiles;
        if (tempFiles && tempFiles.length > 0) {
          const audioFile = tempFiles[0];
          
          if (audioFile.size > 50 * 1024 * 1024) {
            tt.showToast({ title: '文件过大，请选择小于50MB的文件', icon: 'none' });
            return;
          }

          this.setData({
            selectedAudioFile: audioFile.tempFilePath,
            selectedAudioName: audioFile.name || '自定义音频文件'
          });
          
          tt.showToast({ title: '音频文件选择成功', icon: 'success' });
        }
      },
      fail: (err) => {
        console.error('选择音频文件失败:', err);
        tt.showToast({ title: '选择音频文件失败', icon: 'none' });
      }
    });
  },

  // 选择音频
  handleAudioChange(e) {
    const index = e.detail.value;
    const audioOptions = this.data.audioOptions || [];
    if (audioOptions[index]) {
      this.setData({
        selectedAudioName: audioOptions[index].name,
        selectedAudioValue: audioOptions[index].value
      });
    }
  },

  // 输入文本
  handleTextInput(e) {
    this.setData({ inputText: e.detail.value });
  },

  submit(){
    // 上传图片
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
      
      // 根据templateId判断是否需要上传音频文件
      if (this.data.templateId == 0 && this.data.selectedAudioFile) {
        // 上传自定义音频文件
        return uploadImage({
          url: 'http://110.40.183.254:8001/files/upload/audio',
          name: 'file',
          filePath: this.data.selectedAudioFile,
          formData: { priority: '0' }
        })
        .then((audioRes) => {
          console.log("上传音频成功")
          const audioUrl = audioRes.data.file_url;
          return { imageUrl, audioFiles: [audioUrl] };
        });
      } else {
        // 使用预设音频
        return { imageUrl, audioFiles: [] };
      }
    })
    .then(({ imageUrl, audioFiles }) => {
      // 请求生成视频
      return requestWithAuth({
        url: "http://110.40.183.254:8001/tasks/video",
        method: 'POST',
        data: {
          image_files: [imageUrl],
          audio_files: audioFiles,
          template_id: this.data.templateId == 0 ? null : parseInt(this.data.templateId),
          input_params: this.data.templateId == 0 ? {} : {
            'music': this.data.selectedAudioValue,
            'clothes': this.data.inputText
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
  },

  handleError: function (message) {
    tt.hideLoading();
    this.setData({ isLoading: false });
    tt.showToast({ title: message, icon: 'none' });
  }
});
