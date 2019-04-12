
var app = getApp();
const username = wx.getStorageSync('username');
const db = wx.cloud.database();
const _ = db.command;
Page({

  //奖品配置
  awardsConfig: {
    chance: true,
    awards: [
      { 'index': 0, 'name': '谢谢' },
      { 'index': 1, 'name': '1水滴' },
      { 'index': 2, 'name': '3水滴' },
      { 'index': 3, 'name': '8水滴' },
      { 'index': 4, 'name': '10水滴' },
      { 'index': 5, 'name': '12水滴' },
      { 'index': 4, 'name': '15水滴' },
      { 'index': 5, 'name': '20水滴' }
    ]
  },

  data: {
    awardsList: {},
    animationData: {},
    btnDisabled: '',
  },

  onReady: function (e) {
    this.drawAwardRoundel();

    //分享
    wx.showShareMenu({
      withShareTicket: true
    });

    
  },

  //画抽奖圆盘
  drawAwardRoundel: function () {
    var awards = this.awardsConfig.awards;
    var awardsList = [];
    var turnNum = 1 / awards.length;  // 文字旋转 turn 值
    // 奖项列表
    for (var i = 0; i < awards.length; i++) {
      awardsList.push({ turn: i * turnNum + 'turn', lineTurn: i * turnNum + turnNum / 2 + 'turn', award: awards[i].name });
    }
    this.setData({
      btnDisabled: this.awardsConfig.chance ? '' : 'disabled',
      awardsList: awardsList
    });
  },

  createNonceStr: function () {
    return Math.random().toString(36).substr(2, 15)
  },

  //发起抽奖
  playReward: function () {
    //中奖index
    var awardIndex = Math.floor(Math.random() * 8);
    var runNum = 6;//旋转8周
    var duration = 3000;//时长

    // 旋转角度
    this.runDeg = this.runDeg || 0;
    this.runDeg = this.runDeg + (90 - this.runDeg % 360) + (360 * runNum - awardIndex * (360 / 8))
    //创建动画
    var animationRun = wx.createAnimation({
      duration: duration,
      timingFunction: 'ease'
    })
    animationRun.rotate(this.runDeg).step();
    this.setData({
      animationData: animationRun.export(),
      btnDisabled: 'disabled'
    });

    // 中奖提示
    var awardsConfig = this.awardsConfig;
    setTimeout(function () {
      wx.showModal({
        title: '恭喜',
        content: '获得' + (awardsConfig.awards[awardIndex].name),
        showCancel: false
      });
      this.setData({
        btnDisabled: 'disabled'
      });
    }.bind(this), duration);

    // String To num
   let incPoints = parseInt(awardsConfig.awards[awardIndex].name);
   wx.cloud.callFunction({
     name: 'addWaters',
     data: {
       addPoints: incPoints,
       signOrLottery: 'lottery'
     }
   }) 
  },

  backToHome: function(){
    wx.switchTab({
      url: '/pages/index/index',
    })
  },

})
