/* release_job  用户发布订单时调用，功能：
    1.将订单信息添加到bills表
    2.users表released_bill数组增加
  参数：用户发布的订单的id, 发布订单的用户名
  参数太多无法实现...............
*/
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: 'test-ae626c' })
const db = cloud.database();
const _ = db.command;
const wxContext = cloud.getWXContext();
// 云函数入口函数 
exports.main = async (event, context) => {
  let bill_id = event.bill_id;   //获取传递的参数

}

//add messages to bills table
async function addBills() {

  return db.collection('users').where({
    _openid: wxContext.OPENID
  }).get()
}

//add bill_id to users's released_bills
async function getDocById(idArray) {
  return db.collection('bills').where({
    bill_id: _.in(idArray)
  }).get()
}
