// delete_job:删除订单逻辑
/* 传入的参数:订单id
   逻辑：1.只有自己能删除自己的订单，通过OPENID查询users表，在released_bills
   中找到这个订单id并将其删除;
   2.还要根据billid删除bills表中的这条订单的记录*/
// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: 'test-ae626c' })
const db = cloud.database();
const _ = db.command;
const wxContext = cloud.getWXContext()
// 云函数入口函数
exports.main = async (event, context) => {
  const deleteBillId = event.deleteBillId
  const deleteDocId = event.deleteDocId     // bills表中要删除的记录的_id
  let docArray = await getDocByOpenid()
  let docId = docArray.data[0]._id           // 只能通过doc的id来更新?
  let newReleasedBills = docArray.data[0].released_bills
  // 将要删除的bill的id剔除
  let tmp = newReleasedBills.splice(newReleasedBills.indexOf(deleteBillId), 1) // 会改变原数组
  return Promise.all([
    updateUsers(docId, newReleasedBills),
    updateBills(deleteDocId)
  ])
}

function getDocByOpenid() {
  return db.collection('users').where({
    _openid: wxContext.OPENID
  }).get()
}

// 更新users表
function updateUsers(docId, newReleasedBills) {
  return db.collection('users').doc(docId).update({
    // data传入需要局部更新的数据
    data: {
      released_bills: newReleasedBills
    }
  })
}

// 更新bills表
function updateBills(deleteDocId) {
  return db.collection('bills').doc(deleteDocId).remove()
}