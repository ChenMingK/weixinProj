// checkSecond
/* 当用户在发布的订单中发现了处于onCheckd状态的订单就可以点击确定，触发checkSecond云函数
处理第二个逻辑,可以传入的参数:一个bills中的任何信息
需要的信息:publish_user get_user bill_id waterPoints bill_doc_id
即：
users表：
1.发布人的水滴数扣除，接收人的水滴数增加 
2.发布人的release_bills删除该订单id，接收人的accepted_bills也删除该订单id
bills表：
3.删除该订单 
TODO:暂时用username来查询user表，再往后需要考虑使用openid来查询，那么处理订单时，
get_user和publish_user就需要更改，或者直接再加上一个get_user_openid和publish_user_openid
貌似小程序端不好获取openid
*/
const cloud = require('wx-server-sdk')
cloud.init({ env: 'test-ae626c' })
const db = cloud.database();
const _ = db.command;
const wxContext = cloud.getWXContext()

// 云函数入口函数
exports.main = async (event, context) => {
  const publish_user = event.publish_user
  const get_user = event.get_user
  const bill_id = event.bill_id
  const waterPoints = event.waterPoints
  const bill_doc_id = evnet.bill_doc_id

  const getUserDoc = await getUser(get_user)
  const publishUserDoc = await getUser(publish_user)
  const getUserDocId = getUserDoc.data[0]._id
  const publishUserDocId = publishUserDoc.data[0]._id
  // 新的接收订单和发布订单的数组
  let acceptNewBills = getUserDoc.data[0].accepted_bills
  acceptNewBills.splice(acceptNewBills.indexOf(bill_id), 1)

  let publishNewBills = publishUserDoc.data[0].released_bills
  publishNewBills.splice(publishNewBills.indexOf(bill_id), 1)
  
  return Promise.all([
    updateGetUser(getUserDocId, waterPoints, acceptNewBills),
    updatePublishUser(publishUserDocId, -waterPoints, publishNewBills),
    deleteBills(bill_doc_id)
  ])
}
// 根据username获取doc await
function getUsers(username) {
  return db.collection('users').where({
    username: username
  }).get()
}

// 更新接单人users表信息 all
function updateGetUser(docId, waterPoints, newBills) {
  return db.collection('users').doc(docId).update({
    data: {
      waterPoints: _.inc(waterPoints),
      accepted_bills: newBills
    }
  })
}


// 发单人扣水滴 将订单从已发布的订单中删除
// 更新发单人users表信息 all
function updatePublishUser(docId, waterPoints, newBills) {
  return db.collection('users').doc(docId).update({
    data: {
      waterPoints: _.inc(waterPoints),
      released_bills: newBills
    }
  })
}
// 将订单从bills表中删除 all
function deleteBills(bill_doc_id) {
  return db.collection('bills').doc(bill_doc_id).remove()
}
/*
function dealPublish_user(publish_user, waterPoints, bill_id) {
  return db.collection('users').where({
    username: publish_user
  }).get()
    .then(res => {
      let newBills = res.data[0].released_bills
      let tmp = newBills.splice(newBills.indexOf(bill_id), 1)
      db.collection('users').doc(res.data[0]._id).update({
        waterPoints: _.inc(waterPoints),
        accepted_bills: newBills
      })
    })
}*/
// 接单人加水滴 将订单从已接受的订单中删除
/* function dealGet_user(get_user, waterPoints, bill_id) {
  // 可以在这里写多个.then吗？
  return db.collection('users').where({
    username: get_user,
    accepted_bills: newBills
  }).get()
    .then(res => {
      let newBills = res.data[0].accepted_bills
      let tmp = newBills.splice(newBills.indexOf(bill_id), 1)
      db.collection('users').doc(res.data[0]._id).update({
        waterPoints: _.inc(waterPoints),
        accepted_bills: newBills
      })
    })
}*/
