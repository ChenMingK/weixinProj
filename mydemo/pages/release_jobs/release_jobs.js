const app = getApp();
const db = wx.cloud.database({ env: 'test-ae626c' });
const _ = db.command;
const username = wx.getStorageSync('username');
let avatarUrl
Page({
  data: {
    content: '',
    waterPoints: 0,
    index: 0,
    collegeArray: ['湖南大学','中南大学','湖南师范大学'],
    time: '12:01',
    date: '2019-03-19',
    extra: '',
    tags: [],
    maxWaterPoints: 0,
    typeIndex: 0,
    typeArray: ['代购','代取物品','打扫','学习辅导','其他'],

  },

  //当小程序启动，或从后台进入前台显示，会触发 onShow
  onShow(){  
      // 先异步获取用户头像信息，从本地缓存中获取，app.js中异步缓存
      wx.getStorage({
        key: 'avatarUrl',
        success: function(res) {
          avatarUrl = res.data
          // console.log(res.data)
        },
      })
      db.collection('users').where({
        username: username
      }).get()
        .then(res => {
          this.setData({
            maxWaterPoints: res.data[0].waterPoints
          })
        })
  },
  bindCollegeChange: function (e) {
    //console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })
  },
  bindTimeChange: function (e) {
    //console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      time: e.detail.value
    })
  },
  bindDateChange: function (e) {
    //console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      date: e.detail.value
    })
  },
  bindSliderChange: function(e){
   // console.log('slider发生改变，携带值为', e.detail.value);
    this.setData({
      waterPoints: e.detail.value
    })
  },
  bindTypeChange: function(e){
    this.setData({
      typeIndex: e.detail.value
    })
  },
  
  formSubmit: function (e) {
    /*
      tags: colleageArray[index], time, date  type:String
      form: content, extra, waterPoints
      else messages: bill_id, publishDate, state, publish_user, get_user
    */ 
    const formValue = e.detail.value;
    if (!formValue.content) {
      wx.showToast({ title: '请填写内容', icon: 'none' });
      return;
    }
    if (this.data.waterPoints === 0) {
      wx.showToast({
        title: '至少1个水滴',
        icon: 'none'
      });
      return;
    }

    this.setData({
      tags: [this.data.time, this.data.collegeArray[this.data.index], 
            this.data.date, this.data.typeArray[this.data.typeIndex]],
      content: formValue.content,
      extra: formValue.extra,
    })

    const _this = this;
    const content = this.data.content;
    const tags = this.data.tags; //数组赋值?
    const extra = this.data.extra;
    const waterPoints = this.data.waterPoints;
    
    let date = new Date();
    let dateString = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate()
      + ' ' + padDate(date.getHours()) + ':' + padDate(date.getMinutes()) 
      + ':' + padDate(date.getSeconds())
    console.log(dateString)

    let bill_id = randomWord(4, 8);     //生成的id长度4 - 8


    let promises = [dbOperateBills(), dbOperateUsers()];
    Promise.all(promises).then(function(result){
      wx.showToast({
        title: '发布成功,2s后自动跳转',
        icon: 'none'
      });
      setTimeout(pageChange, 2000);  //2s后跳转页面
      //...所有Promise成功后执行，这些Promise并不是按顺序执行的
    }).catch(function(err){
        //...
        wx.showToast({
          title: '出错啦...',
        })
    })
      
    function dbOperateBills(){    //return a Promise ? 
      return db.collection('bills').add({
        data: {
          bill_id: bill_id,
          publish_user: username,
          get_user: 'none',
          content: content,
          tags: tags,
          extra: extra,
          waterPoints: waterPoints,
          publishDate: dateString,
          state: 'onReceived',
          avatarUrl: avatarUrl
        }
      });
    }

    function dbOperateUsers(){
      return db.collection('users').where({
        username: username
      }).get()      //get Doc
        .then(res => {
          let docid = res.data[0]._id;
          db.collection('users').doc(docid).update({
            data: {
              released_bills: _.push(bill_id),
              waterPoints: _.inc(-_this.data.waterPoints)
            }
          })
        })
    }
    
    function pageChange() {
      _this.setData({
        content: '',
        tags: [],
        extra: '',
        waterPoints: '',
        index: 0,
      });
      wx.switchTab({
        url: '/pages/index/index',
      })
    };
   


    function randomWord(min, max) {  //min最短长度  max最大长度
      let str = "";
      let range = Math.round(Math.random() * (max - min)) + min;
      let arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

      // 随机产生  从上面的数组中随机选择range次数即可

      for (let i = 0; i < range; i++) {
        let pos = Math.round(Math.random() * (arr.length - 1));
        str += arr[pos];
      }
      return str;
    }

    function padDate(num) {
      if (num < 10)
        return '0' + num
      else 
        return num
    }
  },

  formReset: function () {
    //console.log('form发生了reset事件')
  }
  




})