// 云函数入口文件 该函数用于用户注册
const cloud = require('wx-server-sdk')
cloud.init({ env: 'test-ae626c' })
const db = cloud.database();
const _ = db.command;
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let username = event.username
  let avatarUrl = event.avatarUrl

  return db.collection('users').add({
    data: {
      username: username,
      waterPoints: 0,
      avatarUrl: avatarUrl,
      _openid: wxContext.OPENID,
      appid: wxContext.APPID,
      hasSigned: false,
      hasLotteryed: false
    }
  })
}