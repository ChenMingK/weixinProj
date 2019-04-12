// cloud_Rjobs:获取该用户发布的所有bills
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: 'test-ae626c' })
const db = cloud.database();
const _ = db.command;
const wxContext = cloud.getWXContext();
// 云函数入口函数 
exports.main = async (event, context) => {
  let doc = await getIdArray();
  // 未注册的用户点击个人主页
  if(doc.data.length === 0 || doc.data[0].released_bills == undefined){
    return {
      flag: false
    }
  }

  let myArray = doc.data[0].released_bills;  //这个确实是账单的id的数组了
  //然后查找所有id在这个数组中的记录，且用一个数组存储这些记录，最后作为返回给小程序端
  let docArraytmp = await getDocById(myArray); 
  let docArray = docArraytmp.data;
  for (let i = 0; i < docArray.length; i++) {
    docArray[i].publishDate = docArray[i].publishDate.toLocaleString();
  }
  return {
    docs: docArray,
    flag: true,
  }
}

function getIdArray(){
  return db.collection('users').where({
    _openid: wxContext.OPENID
  }).get()
}

function getDocById(idArray){
  return db.collection('bills').where({
    bill_id: _.in(idArray)
  }).get()
}
