const imageBase64 = require('../../utils/imageBase64');

Page({
  data: {
    buttons: [
      {
        id: 1,
        title: '🖼️ 歌词卡片',
        desc: '生成你的专属音乐卡片！',
        bgImage: imageBase64.cdplayer
      },
      {
        id: 2,
        title: '🎵 现场live秀',
        desc: '上传照片和音乐生成你的live秀',
        bgImage: imageBase64.concert
      },
      {
        id: 3,
        title: '🎬 卡点变装',
        desc: '一键实现AI卡点变装',
        bgImage: imageBase64.people
      }
    ]
  },

  navigateToDetail(e) {
    const { id } = e.currentTarget.dataset;
    let url = '/pages/detail/detail';
    
    if (id === 2) url = '/pages/template-create/template-create';
    if (id === 3) url = '/pages/music-select/music-select';
    
    tt.navigateTo({ url });
  }
});
