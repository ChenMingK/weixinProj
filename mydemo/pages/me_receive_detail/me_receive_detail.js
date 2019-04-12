// pages/detail1/detail1.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    item: {},
    billState: '',
    enableButton: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // // console.log(options)
    // // console.log(options.item)
    let parseItem = JSON.parse(options.item)
    // console.log(parseItem)
    this.setData({
      item: parseItem,
      billState: parseItem.state,
      enableButton: parseItem.state === 'onChecked' ? true : false 
      // 已经为onChecked状态则禁用
    })
    // // console.log(this.data.enableButton)
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  // 传入的参数:要处理的订单的id号
  confirmBill() {
    let _this = this
    const targetBillId = this.data.item.bill_id
    // console.log(targetBillId)
    wx.cloud.callFunction({
      name: 'checkFirst',
      data: {
        billId: targetBillId
      },
      success: res => {
        wx.showToast({
          title: '确认订单成功',
        })
        setTimeout(() => {
          wx.redirectTo({
            url: '/pages/me_receive/me_receive',
          })
        }, 1000)
      },
      fail: err => {
        // console.log('云函数调用失败')
      }
    })
  }

})