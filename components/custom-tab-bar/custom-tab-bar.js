Component({
  data: {
    current: 0,
    list: [
      { pagePath: "pages/detail-entry/detail-entry", text: "制作" },
      { pagePath: "pages/profile/profile", text: "我的" }
    ],
    iconPath: [
      "/images/tabbar/make.png",
      "/images/tabbar/user.png"
    ],
    selectedIconPath: [
      "/images/tabbar/make_selected.png",
      "/images/tabbar/user_selected.png"
    ]
  },

  pageLifetimes: {
    show() {
      this.updateCurrentTab();
    }
  },

  methods: {
    updateCurrentTab() {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const currentPath = currentPage.route;
      const currentIndex = this.data.list.findIndex(item => 
        currentPath.includes(item.pagePath.split('/').pop())
      );
      if (currentIndex !== -1) {
        this.setData({ current: currentIndex });
      }
    },

    switchTab(e) {
      const index = e.currentTarget.dataset.index;
      this.setData({ current: index });
      tt.switchTab({
        url: `/${this.data.list[index].pagePath}`,
        success: () => this.updateCurrentTab()
      });
    }
  }
});
