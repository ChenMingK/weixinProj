// triggerFunc
// 每日凌晨触发该云函数，将所有用户的签到和抽奖状态重置
// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: 'test-ae626c' })
const db = cloud.database();
const _ = db.command;
const wxContext = cloud.getWXContext()

// 云函数入口函数
exports.main = async (event, context) => {
  let docArray = await getDocs()
  let dataArray = docArray.data
  for(let i = 0; i <dataArray.length; i++) {
    await updateUsers(dataArray[i]._id) // 可以这么写么？
  }
  return {
    
  }
}
function getDocs() {
  return db.collection('users').get()
}
// 这个返回的还是promise吗？
function updateUsers(docId) {
  return db.collection('users').doc(docId).update({
    hasSigned: false,
    hasLotteryed: false
  })
}