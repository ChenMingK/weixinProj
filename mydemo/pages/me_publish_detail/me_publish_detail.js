// pages/detail1/detail1.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    item: {},
    billState: '',
    confirmButtonClass: '',
    enableButton: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // // console.log(options)
    // // console.log(options.item)
    let parseItem = JSON.parse(options.item)
    this.setData({
      item: parseItem,
      billState: parseItem.state,
      confirmButtonClass: parseItem.state === 'onChecked' ? 'show' : 'hide',
      enableButton: parseItem.state === 'onChecked' ? false : true
    })
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  deleteBill() {
    // onProcessing 和 onChecked状态都不允许删除
    if (this.item.state === 'onProcessing' || 'onReceived') {
      wx.showToast({
        title: '已有用户接单，无法删除'
      })
    }
    let _this = this
    let targetBillId = this.data.item.bill_id
    let targetDocId = this.data.item._id
    // 需传入的参数，订单的id，记录的id
    wx.cloud.callFunction({
      name: 'delete_job',
      data: {
        deleteBillId: targetBillId,
        deleteDocId: targetDocId
      },
      success: res => {
        wx.showToast({
          title: '删除订单成功',
        })
       // this.onShow()
       setTimeout(() => {
         wx.redirectTo({
           url: '/pages/me_publish/me_publish',
         })
       }, 1000)
      },
      fail: err => {
        // // // console.log(err)
      }
    })
  },

  confirmBill() {
    let _this = this
    const targetBillId = this.data.item.bill_id
    const targetDocId = this.data.item._id
    const waterPoints = this.data.item.waterPoints
    const publish_user = this.data.item.publish_user
    const get_user = this.data.item.get_user
    // console.log(index, targetBillId)
    // 需要的信息:publish_user get_user bill_id waterPoints bill_doc_id
    wx.cloud.callFunction({
      name: 'checkSecond',
      data: {
        publish_user: publish_user,
        get_user: get_user,
        bill_id: targetBillId,
        bill_doc_id: targetDocId,
        waterPoints: waterPoints
      },
      success: res => {
        wx.showToast({
          title: '确认订单成功',
        })
        setTimeout(() => {
          wx.redirectTo({
            url: 'pages/me_publish/me_publish',
          })
        }, 1000)
      },
      fail: err => {
        // console.log(err)
        console.log(err)
      }
    })
  }
 
})