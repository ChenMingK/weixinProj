//deal_Get  用户点击接单时触发
/*
  1.bills表订单相关信息改变 状态 接单人
  2.users表：接单人accepted_bills数组增加
  需要传入两个参数，接单人username 接单的bill id, users表直接用_openid来操作
*/
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: 'test-ae626c' })
const db = cloud.database();
const _ = db.command;
const wxContext = cloud.getWXContext()
// 云函数入口函数
exports.main = async (event, context) => {
  //参数赋值到本地
  const bill_id = event.bill_id; 
  const username = event.username
  let userData = await getUserData()
  let billData = await getBillData(bill_id) // 注意传参
  return Promise.all([
    opUsers(userData.data[0]._id, bill_id),
    opBills(billData.data[0]._id, username)
  ])
  
}
// 拆分为同步任务和可同时异步执行的任务
// 根据_openid找到user
function getUserData() {
  return db.collection('users').where({
    _openid: wxContext.OPENID
  }).get()
}
// 操作user
function opUsers(docId, bill_id){
  return db.collection('users').doc(docId).update({
    data: {
      accepted_bills: _.push([bill_id]),
    }
  })
  /* return 
  db.collection('users').where({
    _openid: wxContext.OPENID,
  }).get().then(res => {
    db.collection('users').doc(res.data[0]._id).update({
      data:{      //注意何时加data！！！
        accepted_bills: _.push([bill_id]),
      }
    })
  }) */
}
// 根据bill_id找到bill
function getBillData(id) {
  return db.collection('bills').where({
    bill_id: id
  }).get()
}
// 操作bill
function opBills(docId, username) {
  return db.collection('bills').doc(docId).update({
    data: {
      state: 'onProcessing',
      get_user: username,
    }
  })
}
/*
function opBills(id, username){
  return 
  db.collection('bills').where({
    bill_id: id
  }).get().then(res => {
    db.collection('bills').doc(res.data[0]._id).update({
      data: {
        state: 'onProcessing',
        get_user: username,
      }
    })
  })
}
*/
