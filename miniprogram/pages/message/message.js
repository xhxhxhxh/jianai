const request = require('../../request.js')
const dayjs = require('dayjs')
const app = getApp()
require('dayjs/locale/zh-cn')
const calendar = require('dayjs/plugin/calendar')
dayjs.extend(calendar)

Page({

  /**
   * 页面的初始数据
   */
  data: {
    message: [],
    sys: {},
    match: {},
    slideButtons: [
      {
        text: '置顶',
      },
      {
        text: '删除',
        extClass: 'delete',
      }
    ],
    logined: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function (options) {
    const token = app.getGlobal('auth').token
    if(token) {
      this.setData({
        logined: true
      })
    }else {
      this.setData({
        logined: false
      })
    }
    this.getMessage()
  },

  getMessage() {
    request(20).then(res => {
      console.log(res)
      if(res.error === 0) {
        const chat = res.chat
        let topIndex
        chat.forEach((item, index) => {        
          item.last_datetime = dayjs(item.last_datetime).locale('zh-cn').calendar(null, {
            sameDay: 'HH:mm', // The same day ( Today at 2:30 AM )
            nextDay: '[明天]', // The next day ( Tomorrow at 2:30 AM )
            nextWeek: 'dddd', // The next week ( Sunday at 2:30 AM )
            lastDay: '[昨天] HH:mm', // The day before ( Yesterday at 2:30 AM )
            lastWeek: 'dddd', // Last week ( Last Monday at 2:30 AM )
            sameElse: 'DD/MM/YYYY' // Everything else ( 7/10/2011 )
          })
          if(res.top_chat_uid === item.tag_uid) {
            topIndex = index
          }
        })
        if(topIndex !== undefined) {
          chat.unshift(chat.splice(topIndex, 1)[0])
        }
        this.setData({
          sys: res.sys,
          match: res.match,
          message: res.chat
        })
      }  
    }).catch(err => {
      console.log(err)
    })
  },

  goToChat(e) {
    const userName = e.currentTarget.dataset.name
    const tagid = e.currentTarget.dataset.tagid
    wx.navigateTo({
      url: '/pages/chat/chat?userName=' + userName + '&tagid=' + tagid
    })
  },

  goToWhoLikeMe() {
    wx.navigateTo({
      url: '/pages/whoLikeMe/whoLikeMe'
    })
  },

  goToSystemInfo() {
    wx.navigateTo({
      url: '/pages/systemInfo/systemInfo'
    })
  },

  slideButtonTap(e) {
    const index = e.detail.index // 0置顶 1删除
    const tagid = e.currentTarget.dataset.tagid
    const num = e.currentTarget.dataset.index
    if(index === 0) {
      this.toTop(tagid, num)
    }else if(index === 1) {
      this.deleteMessage(tagid, num)
    }
  },

  // 聊天置顶
  toTop(tagid, index) {
    request(33, {tag_uid: tagid}).then(res => {
      if(res.error === 0) {
        const message = [...this.data.message]
        message.unshift(message.splice(index, 1)[0])
        this.setData({
          message
        })
      }  
    }).catch(err => {
      console.log(err)
    })
  },

  // 删除消息
  deleteMessage(tagid, index) {
    request(24, {tag_uid: tagid}).then(res => {
      if(res.error === 0) {
        const message = [...this.data.message]
        message.splice(index, 1)
        this.setData({
          message
        })
      }  
    }).catch(err => {
      console.log(err)
    })
  },

  login() {
    wx.navigateTo({
      url: '/pages/login/login',
    })
  }

})