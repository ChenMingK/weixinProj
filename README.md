# weixinProj
微信小程序(模拟收发单确认订单，签到抽奖短信注册等功能)  

<img src="https://github.com/ChenMingK/weixinProj/blob/master/show.gif" width=40% height=40%/>

# 开发记录
## 注册登录流程设计
 - 小程序端使用 wx.login 经用户同意获取用户信息如用户名和头像地址等
 - 用户填写信息后短信验证（榛子云短信提供的 API）成功后才允许点击注册按钮，然后调用云函数将用户信息存储至数据库 openid 也会同时存入
 - 同时将用户信息存储至 localStorage
 - 下次用户再次进入 App 时，通过 localStorage 中的信息进行登录验证即可
 
 ## tab 切换
 每个可点击的 tab 分别绑定 data-index，在最外层 bindtap 绑定的方法中获取所点击的 tab 的 index 值，再根据 index 的值分别显示对应的 tab-content
 ```html
 <view class="tab-wrapper" bindtap="setActive">
        <view class="tab-item {{isActive == 0 ? 'tab-item-active' : ''}}" data-index="0">关注</view>
        <view class="tab-item {{isActive == 1 ? 'tab-item-active' : ''}}" data-index="1">推荐</view>
        <view class="tab-item {{isActive == 2 ? 'tab-item-active' : ''}}" data-index="2">热榜</view>
        <view class="tab-item-line" animation="{{animationData}}"></view>
</view>
<view class="tab-content {{isActive == 0 ? 'show' : 'hide'}}">
 // ...
</view>
<view class="tab-content {{isActive == 1 ? 'show' : 'hide'}}">
 // ...
</view>
<view class="tab-content {{isActive == 2 ? 'show' : 'hide'}}">
 // ...
</view>
```

## block 和 wx:for wx:key
\<block>\</block>不是一个组件，仅仅是一个包装元素，不会再页面中做任何渲染，只接受控制属性（如wx:for wx:if）

```html
<block wx:for-items="{{released_task_items}}" wx:key="{{index}}">
  <view class='list-wrapper'>
    <view >截止时间： {{item.publishDate}}</view>
    <view >地点： {{item.tags[1]}}</view>
    <view >类型： {{item.tags[3]}}</view>
    <button class="details" bindtap='gotoDetail' data-index='{{index}}'>详  情</button>
  </view>
</block>
```

## 云函数执行多个 Promise
```js
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const MAX_LIMIT = 100
exports.main = async (event, context) => {
  // 先取出集合记录总数
  const countResult = await db.collection('todos').count()
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = db.collection('todos').skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  // 等待所有
  return (await Promise.all(tasks)).reduce((acc, cur) => ({
    data: acc.data.concat(cur.data),
    errMsg: acc.errMsg,
  }))
}
```

# 页面设计
## 整体样式
采用统一的深蓝色/蓝色作为顶部颜色和一些按钮和 icon 的颜色, 各个部分之间统一用浅灰色的线条来分隔

## 首页
首页分为轮播图, 搜索框, 发布的订单三个部分.

调用云函数从数据库获取发布中的订单信息并渲染.

## 发单页面
发单页面整体为一个 form 表单, 通过 textarea 组件可以填写内容, 通过 picker 组件实现需要提供选项的表单信息.

悬赏点数先从数据库读取, 使用 slider 组件实现, 最大值不超过当前用户所拥有的最大点数.

点击“发布”将订单信息存入数据库且加入到当前用户所发布的订单中.

## 个人页面
个人页面提供签到和抽奖功能, 点击签到图标用户点数 +1, 点击抽奖图标跳转到抽奖页面.

点击“我发布的任务”和“我接受的任务”分别跳到对应的详情页面.

## 短信、抽奖
短信页面: 用户初次登录需要通过短信验证进行注册, 输入手机号后通过榛子云短信提供的 API 发送短信并验证.

抽奖页面: 一个转盘, 点击“开始抽奖”后显示旋转动画, 取得对应的水滴点数并增加到用户数据上, 点击一次抽奖后便禁用按钮

上方提供一个回到主页的 text

# 逻辑设计
数据库表设计
1.users表： 

_id（默认）_openid（默认） username（用户名） waterPoints(水滴数)

released_bills(发布的订单，数组，数组成员为订单id（String）)

accepted_bills（接受的订单，同上）

2.bills表：

_id  open_id  bill_id（订单id 保证唯一性）content（内容）extra（备注）tags（标签）

publishDate（发布日期）publish_user（发单人） get_user（接单人（可无）） waterPoints（奖励水滴数）

state（待接收-onReceived，已接受-onProcessing，待审核-onCheckd）

触发条件： 

1.用户登录（点开小程序）：若用户未在 users 表中（根据用户名判断），则加入到 users 表中，信息设置为默认数据

2.发单：用户填写完信息后，首先为该单生成一个唯一的 id，然后 users 表 released_bills 数组中增加该 id，然后 bills 表增加对应的所有信息 

3.接单：触发接单操作后，users 表 get_bills 数组增加相应信息，bills 表对应 id 的记录信息改变（1.接单人 2.state ）

4.完成订单：接单人点击完成后需由发单人审核，审核通过接单人获取对应的水滴数， 同时 bills 表中该 id 对应记录信息改变，users 表中发单人和接单人水滴数都改变（通过username查询）。 

5.显示信息：“me”页面需要读取该用户数据库中的发单、接单信息；

6.抽奖和签到：签到水滴数（inc命令）+  抽奖完成后水滴数（inc命令） 
  
云函数设计：

1.register: 用于用户注册

2.hasRegistered: 检测是否已经注册 

3.search: 根据标签进行搜索, 返回符合条件的 bills 

4.triggerFunc: 每日凌晨自动调用的云函数, 通过设置一个触发器实现, 用于重置用户的签到和抽奖的状态 


