Component({
  properties: {
    current: {
      type: String,
      value: 'detail'
    }
  },

  data: {
    navItems: [
      {
        key: 'detail',
        icon: '🎬',
        text: '制作',
        url: '/pages/detail/detail'
      },
      {
        key: 'profile',
        icon: '👤',
        text: '我的',
        url: '/pages/profile/profile'
      }
    ]
  },

  methods: {
    // 切换页面
    switchPage: function (e) {
      const key = e.currentTarget.dataset.key;
      const item = this.data.navItems.find(nav => nav.key === key);
      
      if (item) {
        // 触发父组件事件
        this.triggerEvent('navchange', { key: key, item: item });
        
        // 使用 redirectTo 替换当前页面
        tt.redirectTo({
          url: item.url,
          success: () => {
            this.setData({ current: key });
          }
        });
      }
    }
  }
});
