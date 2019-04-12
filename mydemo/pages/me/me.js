const app = getApp();
Page({
  data: {
    waterPoints: 0, 
    signURL: "/images/sign.png",
    lotteryURL: "/images/lottery.png",
    hasSigned: 'false',
    hasLotteryed: 'false',
  },

  click1: function () {
    wx.navigateTo({
      url: '/pages/me_publish/me_publish',
    })
  },
  click2: function () {
    wx.navigateTo({
      url: '/pages/me_receive/me_receive',
    })
  },

  onLoad: function () {

  },

  //数据库逻辑实现，加载页面时就获取个人信息，已发布任务，水滴数，接受的任务
  //onShow每次重新到这个页面都执行，因为需要重复更新所以放在onShow
  onShow: function () {
    if (app.globalData.userInfo == null) {  //未注册的话不会执行以下操作
      return;
    }
    //检查本地存储是否实现
    //第二次点进来已经获取了userInfo则会往下执行
    let _this = this;
    let userInfo_here = app.globalData.userInfo;
    let db_username = userInfo_here.nickName;
    const db = wx.cloud.database({ env: 'test-ae626c' });
    //获取用户水滴数（注册时水滴数默认为0就不用获取了）
    db.collection('users').where({
      username: db_username,
    }).get()
      .then(res => {
        if (res.data.length === 1 && res.data[0].waterPoints !== undefined) {
          _this.setData({
            waterPoints: res.data[0].waterPoints,
            hasSigned: res.data[0].hasSigned,
            hasLotteryed: res.data[0].hasLotteryed
          })
        }
        if (_this.data.hasSigned === true) {
          _this.setData({
            signURL: "/images/sign-down.png"
          })
        }
        if (_this.data.hasLotteryed === true) {
          _this.setData({
            lotteryURL: "/images/lottery-down.png"
          })
        }
      })
  },


  signToday: function () {
    let _this = this;
    if (this.data.hasSigned === true) return;
    wx.cloud.callFunction({
      name: 'addWaters',
      data: {
        addPoints: 1,
        signOrLottery: 'sign'
      },
      success: res => {
        wx.showToast({
          title: '签到成功！水滴数+1',
          icon: 'none',
        })
        this.onShow()
      },
      fail: err => {
        console.log('云函数调用失败')
      }
    })
  },

  lottery: function () {
    if (this.data.hasLotteryed === true) return;
    wx.navigateTo({
      url: '/pages/lottery/lottery',
    })
  }
})



