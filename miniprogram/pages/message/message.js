// miniprogram/pages/message/message.js
const message = [
  {
    id: 1,
    type: 'user',
    avatar: '/images/img_xiaoxi_ta@2x.png',
    name: '海绵宝宝',
    date: '10:20',
    message: '小哥哥在吗？有没有兴趣和我深入交流一下',
    messageNum: 3
  },
  {
    id: 2,
    type: 'user',
    avatar: '/images/img_xiaoxi_ta@2x.png',
    name: '海绵宝宝',
    date: '10:20',
    message: '小哥哥在吗？有没有兴趣和我深入交流一下',
    messageNum: 5
  },
  {
    id: 3,
    type: 'user',
    avatar: '/images/img_xiaoxi_ta@2x.png',
    name: '海绵宝宝',
    date: '10:20',
    message: '小哥哥在吗？有没有兴趣和我深入交流一下11111111111',
    messageNum: 1
  },
]

for(let i = 4; i < 20; i++) {
  message.push(
    {
      id: i,
      type: 'user',
      avatar: '/images/img_xiaoxi_ta@2x.png',
      name: '海绵宝宝',
      date: '10:20',
      message: '小哥哥在吗？有没有兴趣和我深入交流一下11111111111',
      messageNum: 1
    }
  )
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    message: message
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  goToChat(e) {
    const userName = e.currentTarget.dataset.name
    wx.navigateTo({
      url: '/pages/chat/chat?userName=' + userName
    })
  }
})