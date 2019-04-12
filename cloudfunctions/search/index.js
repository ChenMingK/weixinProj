// 搜索功能，根据传入的关键字搜素tags中含有关键字的订单
// 返回：符合条件的记录(含多个订单所有信息的数组)
// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: 'test-ae626c' })

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database();
  const _ = db.command;
  const paramTag = event.tag;
  let allBills = await db.collection('bills').get();
  let tagsArray = [];
  for(let i=0; i<allBills.data.length; i++){
    tagsArray.push(allBills.data[i].tags);
  }
  // 遍历每个元素 都是String类型
  let ansArray = [];
  for(let i=0; i<tagsArray.length; i++){
    for(let j=0; j<tagsArray[i].length; j++){
      if(tagsArray[i][j].includes(paramTag)){  // 包含字符串,只支持精确查找
        ansArray.push(allBills.data[i]);
        break;
      }
    }
  }
  let flag = (ansArray.length === 0 ? false : true);
  return {
    flag,
    ansArray,
    tagsArray,
  }
}