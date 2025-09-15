const { get } = require('../../utils/request');
const imageBase64 = require('../../utils/imageBase64');

Page({
  data: {
    // banners: [
    //   { url: '/images/button_bg/cdplayer.jpg' },
    //   { url: '/images/button_bg/concert.jpg' },
    //   { url: '/images/button_bg/people.jpg' }
    // ],
    banners: [
      {
        id: 1,
        title: '歌词卡片',
        url: imageBase64.cdplayer
      },
      {
        id: 2,
        title: '现场live秀',
        url: imageBase64.concert
      },
      {
        id: 3,
        title: '卡点变装',
        url: imageBase64.people
      }
    ],
    cards: [
      {
        id: 101,
        title: '夏日海滩',
        cover: '/images/button_bg/cdplayer.jpg'
      },
      {
        id: 102,
        title: '城市夜景',
        cover: '/images/button_bg/concert.jpg'
      },
      {
        id: 103,
        title: '森林徒步',
        cover: '/images/button_bg/people.jpg'
      },
      {
        id: 104,
        title: '星空延时',
        cover: '/images/button_bg/guitar.jpg'
      },
      {
        id: 105,
        title: '夏日海滩',
        cover: '/images/button_bg/cdplayer.jpg'
      },
      {
        id: 106,
        title: '城市夜景',
        cover: '/images/button_bg/concert.jpg'
      },
      {
        id: 107,
        title: '森林徒步',
        cover: '/images/button_bg/people.jpg'
      },
      {
        id: 108,
        title: '星空延时',
        cover: '/images/button_bg/guitar.jpg'
      }
    ],
    loading: false
  },

  onLoad() {
    this.fetchCardList();
    this.autoRotateTimer = setInterval(() => {
      if (!this.data.isRotating && this.data.velocity === 0) {
        this.setData({
          rotation: (this.data.rotation + 0.5) % 360
        });
      }
    }, 50);
  },

  onUnload() {
    clearInterval(this.autoRotateTimer);
    if (this.inertiaTimer) clearInterval(this.inertiaTimer);
  },

  // 获取卡片流数据
  async fetchCardList() {
    try {
      const res = await get('/api/cards');
      this.setData({
        cards: res.data.map(item => ({
          id: item.id,
          title: item.title,
          cover: item.cover || imageBase64.defaultCover
        })),
        loading: false
      });
    } catch (err) {
      console.error('获取卡片失败:', err);
      this.setData({ loading: false });
    }
  },

  // 点击卡片跳转
  navigateToCreate(e) {
    const { id } = e.currentTarget.dataset;
    console.log(id);
    tt.navigateTo({
      url: `/pages/video-create/video-create?templateId=${id}`,
      success: () => console.log(`跳转成功，携带ID: ${id}`),
      fail: (err) => console.error('跳转失败:', err)
    });
  },

});
