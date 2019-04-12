const app = getApp();
const db = wx.cloud.database({ env: 'test-ae626c' });
const _ = db.command;

Page({
  data: {
    imgUrls: [
      '/images/home/top1.jpg',
      '/images/home/top2.jpg',
      '/images/home/top3.jpg',
      '/images/home/top4.jpg'
    ],
    indicatorDots:false,
    vertical:false,
    items: [],
    searchValue: '',

  },

  onShow: function(){
    //这里不应该用本地存储而应该用数据库来检测
    wx.cloud.callFunction({
      name: 'hasRegistered',
      data: {
        // 这里不需要
      },
      success: res => {   //云函数返回的JSON对象? res
        if(res.result.flag === 0){
          //未注册
          wx.showModal({
            title: '温馨提示',
            content: '只有注册之后才能使用功能哦~',
            success(res) {
              if (res.confirm) {
                wx.navigateTo({
                  //保留当前页面，跳转到应用内的某个页面。但是不能跳到 tabbar 页面。
                  url: '../telephone/telephone',
                })
              }
            }
          })
        }
      },
      fail: err => {
        // console.log('云函数调用失败');
      }
    })

    // 显示订单逻辑实现
    let _this = this;
    // 调用应用实例的方法获取全局数据
    // 获取全部已经发布的订单（暂定）并绑定到本地数据
    db.collection('bills').get()
      .then(res => {
        let itemsArray = [];
        for (let i = 0; i < res.data.length; i++) {
          if (res.data[i].state === 'onReceived') {
            itemsArray.push(res.data[i]);
          }
        }
        // for (let i = 0; i < itemsArray.length; i++) {
        //   itemsArray[i].publishDate = itemsArray[i].publishDate.toLocaleString();
        // }
        _this.setData({
          items: itemsArray
        })
      });
  },

  bindSearchInput: function(e){
    this.setData({
      searchValue: e.detail.value
    })
  },

  // 搜索功能
  search: function(){
    let _this = this;
    wx.cloud.callFunction({
      name: 'search',
      data: {
        tag: _this.data.searchValue
      },
      success: res => {
        if(res.result.flag === false){
          wx.showToast({
            title: '请输入要查找的订单类型或所在大学',
            icon: 'none'
          })
        }
        else{
          _this.setData({
            items: res.result.ansArray
          })
        }
        // console.log(res);
      },
      fail: err => {
        // console.log('云函数search 调用失败')
      }
    })
  },
  // 点击详情跳转到详情页,需要携带参数
  toDetail: function (e) {
    // console.log(e)
    wx.navigateTo({
      url: '/pages/detail/detail?item=' 
      + JSON.stringify(this.data.items[e.currentTarget.dataset.index]),
    })
  }
})
