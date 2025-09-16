const { requestWithAuth } = require('../../utils/request');

Page({
  data: {
    currentScore: 0,
    rechargePackages: [
      {
        id: 1,
        amount: 100,
        price: 10,
        bonus: 0,
        label: '新手包'
      },
      {
        id: 2,
        amount: 500,
        price: 45,
        bonus: 50,
        label: '超值包'
      },
      {
        id: 3,
        amount: 1000,
        price: 80,
        bonus: 200,
        label: '推荐包'
      },
      {
        id: 4,
        amount: 2000,
        price: 150,
        bonus: 500,
        label: '豪华包'
      }
    ],
    selectedPackage: null,
    isLoading: false
  },

  onLoad() {
    this.loadUserInfo();
  },

  onShow() {
    this.loadUserInfo();
  },

  loadUserInfo() {
    // 获取用户积分信息
    const userInfo = tt.getStorageSync('userInfo') || {};
    this.setData({
      currentScore: userInfo.score || 0
    });
  },

  selectPackage(e) {
    const packageId = e.currentTarget.dataset.id;
    const selectedPackage = this.data.rechargePackages.find(pkg => pkg.id === packageId);
    this.setData({
      selectedPackage: selectedPackage
    });
  },

  confirmPurchase() {
    if (!this.data.selectedPackage) {
      tt.showToast({
        title: '请选择充值套餐',
        icon: 'none'
      });
      return;
    }

    const pkg = this.data.selectedPackage;
    tt.showModal({
      title: '确认充值',
      content: `确认支付 ¥${pkg.price} 购买 ${pkg.amount + pkg.bonus} 积分？`,
      success: (res) => {
        if (res.confirm) {
          this.processPurchase(pkg);
        }
      }
    });
  },

  processPurchase(pkg) {
    this.setData({ isLoading: true });
    tt.showLoading({ title: '处理中...' });

    // 模拟支付过程
    setTimeout(() => {
      this.mockPayment(pkg);
    }, 2000);
  },

  mockPayment(pkg) {
    // 模拟支付成功
    const totalAmount = pkg.amount + pkg.bonus;
    const newScore = this.data.currentScore + totalAmount;
    
    // 更新本地存储
    const userInfo = tt.getStorageSync('userInfo') || {};
    userInfo.score = newScore;
    tt.setStorageSync('userInfo', userInfo);

    this.setData({
      currentScore: newScore,
      selectedPackage: null,
      isLoading: false
    });

    tt.hideLoading();
    tt.showToast({
      title: `充值成功！获得${totalAmount}积分`,
      icon: 'success',
      duration: 2000
    });

    // 实际项目中应该调用真实的支付接口
    // this.callPaymentAPI(pkg);
  },

  callPaymentAPI(pkg) {
    // 真实支付接口调用
    requestWithAuth({
      url: 'http://110.40.183.254:8001/payment/recharge',
      method: 'POST',
      data: {
        package_id: pkg.id,
        amount: pkg.price
      }
    }).then(res => {
      // 处理支付结果
      if (res.success) {
        this.handlePaymentSuccess(pkg);
      } else {
        this.handlePaymentFailed(res.message);
      }
    }).catch(err => {
      this.handlePaymentFailed('支付失败，请重试');
    }).finally(() => {
      this.setData({ isLoading: false });
      tt.hideLoading();
    });
  },

  handlePaymentSuccess(pkg) {
    const totalAmount = pkg.amount + pkg.bonus;
    const newScore = this.data.currentScore + totalAmount;
    
    this.setData({
      currentScore: newScore,
      selectedPackage: null
    });

    tt.showToast({
      title: `充值成功！获得${totalAmount}积分`,
      icon: 'success'
    });
  },

  handlePaymentFailed(message) {
    tt.showToast({
      title: message || '支付失败',
      icon: 'none'
    });
    this.setData({ selectedPackage: null });
  },

  goBack() {
    tt.navigateBack();
  }
});
