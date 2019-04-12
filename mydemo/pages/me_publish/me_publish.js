// pages/publish/publish.js
Page({

  /**
   * 页面的初始数据
   */
  data:
  {
    //需要从数据库获取
    released_task_items: [],

  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 发布的工作
    let _this = this
    wx.cloud.callFunction({
      name: 'cloud_Rjobs',
      data: {},
      success: res => {
        // 未注册将不会执行
        if (res.result.flag === true) {
          // console.log(res)
          let itemsArray = []
          for (let i = 0; i < res.result.docs.length; i++) {
            itemsArray.push(res.result.docs[i]);
          }
          // console.log(itemsArray)
          _this.setData({
            released_task_items: itemsArray
          })
        }
      },
      fail: err => {
        // console.error('[云函数]  调用失败', err)
      }
    })
  },

  gotoDetail(e) {
    wx.navigateTo({
      url: '/pages/me_publish_detail/me_publish_detail?item='
        + JSON.stringify(this.data.released_task_items[e.currentTarget.dataset.index])
    })
  }

})