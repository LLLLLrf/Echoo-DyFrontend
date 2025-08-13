const app = getApp();

Page({
  data: {},
  onLoad: function () {
  },
  navigateToDetail: function () {
    console.log("clicked");
    tt.navigateTo({
      url: '/pages/detail/detail'
    });
  }
});
