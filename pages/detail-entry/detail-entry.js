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
        title: 'Kpop韩流',
        cover: "http://110.40.183.254:9000/echoo/image/example4-first.jpg"
      },
      // {
      //   id: 2,
      //   title: '奇幻穿越',
      //   cover: "http://110.40.183.254:9000/echoo/image/halibote.png"
      // },
      {
        id: 2,
        title: '',
        cover: "http://110.40.183.254:9000/echoo/image/guanggao.jpg"
      },
      // {
      //   id: 3,
      //   title: '合拍挑战',
      //   url: imageBase64.people
      // }
    ],
    cards: [
      {
        id: 1,
        title: 'Kpop韩流',
        cover: 'http://110.40.183.254:9000/echoo/image/example4-first.jpg',
        color: '#ffffff',
        available: true
      },
      {
        id: 4,
        title: '合拍挑战',
        cover: 'http://110.40.183.254:9000/echoo/image/hepai.jpg',
        color: '#000000',
        available: false
      },
      {
        id: 0,
        title: '故事MV',
        cover: 'http://110.40.183.254:9000/echoo/image/example2-first.jpg',
        color: '#ffffff',
        available: true
      },
      {
        id: 3,
        title: '赛博霓虹',
        cover: 'http://110.40.183.254:9000/echoo/image/nihong.png',
        color: '#ffffff',
        available: false
      },
      {
        id: 5,
        title: '欧美流行',
        cover: 'http://110.40.183.254:9000/echoo/image/europe-example.jpg',
        color: '#ffffff',
        available: true
      },
      {
        id: 6,
        title: '油画世界',
        cover: imageBase64.youhua,
        color: '#ffffff',
        available: false
      }
    ],
    loading: false
  },

  onLoad() {
    // this.fetchCardList();
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
    
    // 查找对应的卡片配置
    const card = this.data.cards.find(card => card.id === id);
    
    // 检查卡片是否可用
    if (!card || !card.available) {
      tt.showToast({
        title: '该模板暂未上线',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    console.log(`跳转到模板 ${id}: ${card.title}`);
    tt.navigateTo({
      url: `/pages/video-create/video-create?templateId=${id}`,
      success: () => console.log(`跳转成功，携带ID: ${id}`),
      fail: (err) => console.error('跳转失败:', err)
    });
  },

});
