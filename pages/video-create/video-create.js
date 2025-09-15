Page({
  data: {
    audioOptions: [
      { name: '背景音乐1', value: 'audio1' },
      { name: '背景音乐2', value: 'audio2' }
    ],
    portraitPreview: null,
    selectedAudioName: null,
    inputText: ''
  },

  onLoad(options) {
    this.setData({ 
      templateId: options.templateId || '未获取到ID',
      loading: false
    }, () => {
      console.log('当前模板ID:', this.data.templateId);
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
  }
});
