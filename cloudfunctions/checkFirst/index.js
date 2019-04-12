// 云函数入口文件
/* 当用户在接受的订单中点击了确认按钮后触发checkFirst云函数，处理第一个逻辑
即：订单状态变更为onCheckd*/
const cloud = require('wx-server-sdk')
cloud.init({ env: 'test-ae626c' })
const db = cloud.database();
const _ = db.command;
const wxContext = cloud.getWXContext()

// 云函数入口函数
exports.main = async (event, context) => {
  // 传入的参数:要处理的订单的id号
  const billId = event.billId
  let res = await getDoc(billId)

  // 改变订单状态 注意data
  return db.collection('bills').doc(res.data[0]._id).update({
    data: {
      state: 'onChecked'
    }
  })
}

function getDoc(billId) {
  return db.collection('bills').where({
    bill_id: billId
  }).get()
}

