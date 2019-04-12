// pages/detail/detail.js
const app = getApp();
const db = wx.cloud.database({ env: 'test-ae626c' });
const _ = db.command;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    item: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  // index界面直接将这个订单的整个信息全部传递过来了
  onLoad: function (options) {
    this.setData({
      item: JSON.parse(options.item)
    })
  },

  accept: function (e) {
    let index = this.data.item.id;
    let _this = this
    let targetBillId = this.data.item.bill_id
    

    const username = wx.getStorageSync('username');  //本地获取用户名
    //这里更准确的写法是改为一个云函数请求，执行成功后刷新当前页面
    if (this.data.item.publish_user === username) {
      wx.showToast({
        title: '不能接自己的单哦~',
        icon: 'none'
      });
      return;
    }
    // console.log(targetBillId)
    // console.log(username)
    // 需要传入两个参数，接单人username 接单的bill id, users表直接用_openid来操作
     wx.cloud.callFunction({
      name: 'deal_Get',
      data: {
        bill_id: targetBillId,
        username: username
      },
      success: res => {
        successAfter()
      },
      fail: err => {

      }
    })
    // 需要传入两个参数，接单人username 接单的bill id, users表直接用_openid来操作
    /* else {
      let promises = [dbOperateBills(), dbOperateUsers()];
      Promise.all(promises).then(function (result) {
        successAfter()
      }).catch(function (err) {
        // ...
      })
      
    }
    // users表操作
    function dbOperateUsers() {
      return db.collection('users').where({
        username: username,
      }).get().then(res => {
        db.collection('users').doc(res.data[0]._id).update({
          data: {
            accepted_bills: _.push([targetBillId]),
          }
        })
      });
    }

    function dbOperateBills() {
      return db.collection('bills').where({
        bill_id: targetBillId,
      }).get().then(res => {
        db.collection('bills').doc(res.data[0]._id).update({
          data: {
            state: 'onProcessing',
            get_user: username,
          }
        })
      })
    }*/

    

    function successAfter() {
      wx.showToast({
        title: '接单成功,2s后自动跳转',
        icon: 'none'
      })
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index',
        })
      }, 2000)
    }


  }
})