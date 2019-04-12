// 云函数入口文件 这个云函数用于增加指定数量的水滴数，通过opendi
const cloud = require('wx-server-sdk')
cloud.init({ env: 'test-ae626c' })
const db = cloud.database();
const _ = db.command;
let wxOpenId
// 云函数入口函数
exports.main = async (event, context) => {
  const addPoints = event.addPoints // maybe a String?
  const signOrLottery = event.signOrLottery
  const wxContext = cloud.getWXContext()
  wxOpenId = wxContext.OPENID
  // 通过_openid获取对应的doc\
  let res = await getDocId()
  let docId = res.data[0]._id
  // must await ? why ? 
  return updateUsers(signOrLottery, docId, addPoints)

}

function getDocId() {
  return db.collection('users').where({
    _openid: wxOpenId
  }).get()
}

function updateUsers(signOrLottery, docId, addPoints) {
  if (signOrLottery === 'sign') {
    return db.collection('users').doc(docId).update({
      data: {
        waterPoints: _.inc(addPoints),
        hasSigned: true
      }
    })
  } 
  else if (signOrLottery === 'lottery') {
    return db.collection('users').doc(docId).update({
      data: {
        waterPoints: _.inc(addPoints),
        hasLotteryed: true
      }
    })
  }
}