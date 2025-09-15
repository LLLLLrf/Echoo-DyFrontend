Page({
    data: {
      nodes: [
        {
          id: 1,
          name: '初始节点',
          model: 'default',
          _displayModel: '默认模型',
          prompt: '',
          duration: 5,
          expanded: false // 新增展开状态字段
        }
      ],
      modelOptions: [
        { value: 'default', name: '默认模型' },
        { value: 'anime', name: '动漫风格' },
        { value: 'realistic', name: '写实风格' }
      ]
    },

    onLoad() {
      // tt.setPickerStyle({
      //   selector: 'picker', // 所有picker组件
      //   textColor: '#ffffff',
      //   backgroundColor: '#1e2b4a',
      //   selectedColor: '#00c2ff',
      //   headerBackgroundColor: '#121d33',
      //   headerColor: '#ffffff'
      // });
    },

    // 修改展开逻辑（移除自动折叠）
    toggleNodeExpand(e) {
      const { id } = e.currentTarget.dataset;
      this.setData({
        nodes: this.data.nodes.map(node => 
          node.id === Number(id) ? { ...node, expanded: true, tempData: {...node} } : 
          node.expanded ? { ...node, expanded: false } : node
        )
      });
    },

    addNode() {
      const newId = Date.now();
      this.setData({
        nodes: [...this.data.nodes, {
          id: newId,
          name: `节点 ${this.data.nodes.length + 1}`,
          model: 'default',
          _displayModel: '默认模型',
          prompt: '',
          duration: 5,
          expanded: false // 新增节点默认折叠
        }]
      });
    },

    removeNode(e) {
      const { id } = e.currentTarget.dataset;
      this.setData({
        nodes: this.data.nodes.filter(node => node.id !== Number(id))
      });
    },

    // 修改保存方法（同步数据并折叠）
    saveNode(e) {
      const { id } = e.currentTarget.dataset;
      const nodeIndex = this.data.nodes.findIndex(node => node.id === Number(id));
      
      this.setData({
        [`nodes[${nodeIndex}]`]: {
          ...this.data.nodes[nodeIndex],
          ...this.data.nodes[nodeIndex].tempData,
          expanded: false
        }
      });
      
      tt.showToast({ title: '保存成功', icon: 'success' });
    },

    handleInputChange(e) {
      const { field, id } = e.currentTarget.dataset;
      const nodeIndex = this.data.nodes.findIndex(node => node.id === Number(id));
      
      if (field === 'model') {
        const selectedIndex = e.detail.value;
        const selectedModel = this.data.modelOptions[selectedIndex]; // 修复变量名
        
        // 同时更新主数据和临时数据
        this.setData({
          [`nodes[${nodeIndex}].model`]: selectedModel.value,
          [`nodes[${nodeIndex}]._displayModel`]: selectedModel.name,
          [`nodes[${nodeIndex}].tempData.model`]: selectedModel.value,
          [`nodes[${nodeIndex}].tempData._displayModel`]: selectedModel.name
        });
      } else if (field === 'enableCharacterImages') {
        // 处理开关切换
        this.setData({
          [`nodes[${nodeIndex}].tempData.${field}`]: e.detail.value
        });
      } else {
        this.setData({
          [`nodes[${nodeIndex}].tempData.${field}`]: e.detail.value
        });
      }
    },

    // 上传主角图片
    uploadCharacterImages(e) {
      const { id } = e.currentTarget.dataset;
      const nodeIndex = this.data.nodes.findIndex(node => node.id === Number(id));
      const currentImages = this.data.nodes[nodeIndex].tempData.characterImages || [];
      
      if (currentImages.length >= 5) {
        tt.showToast({ title: '最多只能上传5张图片', icon: 'none' });
        return;
      }

      tt.chooseImage({
        count: Math.min(5 - currentImages.length, 5),
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const newImages = [...currentImages, ...res.tempFilePaths];
          this.setData({
            [`nodes[${nodeIndex}].tempData.characterImages`]: newImages
          });
          tt.showToast({ title: '图片上传成功', icon: 'success' });
        },
        fail: (err) => {
          console.error('选择图片失败:', err);
          tt.showToast({ title: '选择图片失败', icon: 'none' });
        }
      });
    },

    // 删除主角图片
    removeCharacterImage(e) {
      const { id, index } = e.currentTarget.dataset;
      const nodeIndex = this.data.nodes.findIndex(node => node.id === Number(id));
      const currentImages = this.data.nodes[nodeIndex].tempData.characterImages || [];
      
      currentImages.splice(Number(index), 1);
      this.setData({
        [`nodes[${nodeIndex}].tempData.characterImages`]: currentImages
      });
      tt.showToast({ title: '图片已删除', icon: 'success' });
    },

    // 防止事件冒泡
    noop() {
      // 空函数，防止点击事件冒泡
    },

    submitWorkflow() {
      tt.showLoading({ title: '生成中...' });
      console.log('提交工作流数据:', this.data.nodes);
      setTimeout(() => {
        tt.hideLoading();
        tt.showToast({ title: '生成成功', icon: 'success' });
        tt.navigateBack();
      }, 1500);
    }
  });
  