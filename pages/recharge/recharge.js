const { requestWithAuth } = require('../../utils/request');

Page({
  data: {
    currentScore: 0,
    activeTab: 'subscription', // 'subscription' 或 'credits'
    
    // 订阅套餐
    subscriptionPlans: [
      {
        id: 'pro',
        name: 'Pro',
        price: 29.9,
        period: '月',
        credits: 300,
        features: [
          '300积分/月',
          '免广告体验',
          '优先客服支持',
          '高清视频导出'
        ],
        popular: false
      },
      {
        id: 'pro_max',
        name: 'Pro Max',
        price: 79.9,
        period: '月',
        credits: 1000,
        features: [
          '1000积分/月',
          '免广告体验',
          '专属客服支持',
          '4K高清视频导出',
          '无限云存储',
          '专属模板库'
        ],
        popular: true
      }
    ],

    // 积分充值包
    creditPackages: [
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
    
    selectedPlan: null,
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

  // 切换选项卡
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      activeTab: tab,
      selectedPlan: null,
      selectedPackage: null
    });
  },

  // 选择订阅套餐
  selectPlan(e) {
    const planId = e.currentTarget.dataset.id;
    const selectedPlan = this.data.subscriptionPlans.find(plan => plan.id === planId);
    this.setData({
      selectedPlan: selectedPlan,
      selectedPackage: null
    });
  },

  // 选择积分包
  selectPackage(e) {
    const packageId = e.currentTarget.dataset.id;
    const selectedPackage = this.data.creditPackages.find(pkg => pkg.id === packageId);
    this.setData({
      selectedPackage: selectedPackage,
      selectedPlan: null
    });
  },

  confirmPurchase() {
    const { activeTab, selectedPlan, selectedPackage } = this.data;
    
    if (activeTab === 'subscription' && !selectedPlan) {
      tt.showToast({
        title: '请选择订阅套餐',
        icon: 'none'
      });
      return;
    }
    
    if (activeTab === 'credits' && !selectedPackage) {
      tt.showToast({
        title: '请选择充值套餐',
        icon: 'none'
      });
      return;
    }

    if (activeTab === 'subscription') {
      const plan = selectedPlan;
      tt.showModal({
        title: '确认订阅',
        content: `确认支付 ¥${plan.price}/${plan.period} 订阅 ${plan.name}？\n包含 ${plan.credits} 积分和专属权益`,
        success: (res) => {
          if (res.confirm) {
            this.processSubscription(plan);
          }
        }
      });
    } else {
      const pkg = selectedPackage;
      tt.showModal({
        title: '确认充值',
        content: `确认支付 ¥${pkg.price} 购买 ${pkg.amount + pkg.bonus} 积分？`,
        success: (res) => {
          if (res.confirm) {
            this.processPurchase(pkg);
          }
        }
      });
    }
  },

  processSubscription(plan) {
    this.setData({ isLoading: true });
    tt.showLoading({ title: '处理中...' });

    // 模拟订阅过程
    setTimeout(() => {
      this.mockSubscription(plan);
    }, 2000);
  },

  processPurchase(pkg) {
    this.setData({ isLoading: true });
    tt.showLoading({ title: '处理中...' });

    // 模拟支付过程
    setTimeout(() => {
      this.mockPayment(pkg);
    }, 2000);
  },

  mockSubscription(plan) {
    // 模拟订阅成功
    const newScore = this.data.currentScore + plan.credits;
    
    // 更新用户信息
    let userInfo = tt.getStorageSync('userInfo') || {};
    userInfo.score = newScore;
    userInfo.subscription = {
      plan: plan.id,
      name: plan.name,
      expireDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30天后过期
      features: plan.features
    };
    tt.setStorageSync('userInfo', userInfo);

    this.setData({ 
      currentScore: newScore,
      isLoading: false,
      selectedPlan: null 
    });

    tt.hideLoading();
    tt.showToast({
      title: `订阅成功！获得${plan.credits}积分`,
      icon: 'success',
      duration: 2000
    });

    // 延迟返回
    setTimeout(() => {
      tt.navigateBack();
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
