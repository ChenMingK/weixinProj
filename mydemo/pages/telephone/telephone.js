// pages/telephone/telephone.js
const zhenzisms = require('../../utils/zhenzisms.js')
const app = getApp();
zhenzisms.client.init('https://sms_developer.zhenzikj.com', '101178',  '6e6ca566-5380-4ff8-bc54-5f09886fce1a') // 短信初始化
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    telephoneNumber: '',
    checkNumber: '',
    timeCount: 0,
    sendText: '发送'
  },

  onLoad: function(){
    // console.log(app.globalData)
    // console.log(client)
    if (app.globalData.userInfo) {  //如果获取到userInfo了，就直接设置
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },

  getUserInfo: function (e) {
    //console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
    //在这里把用户名和头像或其他信息存储到本地
    let userInfo = e.detail.userInfo;
    wx.setStorageSync('username', userInfo.nickName);
    wx.setStorageSync('avatarUrl', userInfo.avatarUrl);
  },
  setTelephoneNumber: function(e) {
    this.setData({
      telephoneNumber: e.detail.value
    })
  },
  setCheckNumber: function(e) {
    this.setData({
      checkNumber: e.detail.value
    })
  },
  send: function () {
    let _this = this
    if (this.data.telephoneNumber.trim() === '' || this.data.telephoneNumber.length !== 11) {
      wx.showToast({
        title: '请输入正确的手机号码',
        icon: 'none'
      })
      this.setData({
        telephoneNumber: ''
      })
      setTimeout(() => {
        wx.hideToast()
      }, 1000)
      return 
    }
    zhenzisms.client.sendCode(function(res) {
      // console.log(res.data)
    }, this.data.telephoneNumber, '验证码为:{code}', 1, 60, 4)
    // 倒计时逻辑
    this.setData({
      timeCount: 60,
      sendText: '重新发送'
    })
    let intervalTask = setInterval(() => {
      if (_this.data.timeCount > 0) {
        _this.setData({
          timeCount: --_this.data.timeCount
        })
      }
    }, 1000)
    setTimeout(() => {
      clearInterval(intervalTask)
    }, 66000) // 60s 多点时间处理...
  },
  check: function() {
    // console.log(this.data.telephoneNumber, this.data.checkNumber)
    let result = zhenzisms.client.validateCode(this.data.telephoneNumber, this.data.checkNumber)
    let username = app.globalData.userInfo.nickName // 用户昵称
    let avatarUrl = app.globalData.userInfo.avatarUrl // 头像地址
    if (result === 'ok') { 
      // 调用注册云函数并传递用户名等信息
      wx.cloud.callFunction({
        name: 'register',
        data: {
          username: username,
          avatarUrl: avatarUrl
        },
        success: res => {
          wx.showToast({
            title: '注册成功,2s后自动跳转',
            icon: 'none'
          })
          setTimeout(() => {
            wx.switchTab({
              url: '/pages/index/index',
            })
          }, 2000)
        },
        fail: err => {
          // console.log('云函数register调用失败')
        }
      })
    }
    else if (result === 'code_error') { // 校验码不一致
      wx.showToast({
        title: '验证码不一致',
        icon: 'none'
      })
    }
    else {
      wx.showToast({
        title: '校验出错',
        icon: 'none'
      })
    }
  }
})
