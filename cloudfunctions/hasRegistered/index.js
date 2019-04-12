// 该函数检查用户是否已经注册
// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: 'test-ae626c' })

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID;
  const db = cloud.database();
  const _ = db.command;

  const doc =  await db.collection('users').where({
    _openid: openid
  }).get();
  const flag = doc.data.length;
  return {
    flag
  }
}
