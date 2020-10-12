const request = require('../../request.js')
const dayjs = require('dayjs')
const app = getApp()
require('dayjs/locale/zh-cn')
const calendar = require('dayjs/plugin/calendar')
dayjs.extend(calendar)
let timeout = null
let photoApply = null

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
    logined: true,
    showDialog: false,
    content: '',
    buttons: [{text: '查看对方'}, {text: '允许查看'}],
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
    this.getPhotoApply()
    timeout = setInterval(this.getMessage, 3000)
    photoApply = setInterval(this.getPhotoApply, 10000)
    if(this.data.showDialog && this.photoApplyInfo && !this.photoApplyInfo.have_photo) {
      // 当上传照片完成时更改弹窗按钮状态
      const mid = this.photoApplyInfo.mid
      this.getPhoto(mid)
    }
  },

  onHide() {
    this.clearTimeout()
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
            sameElse: 'YYYY/MM/DD' // Everything else ( 7/10/2011 )
          })
          if(res.top_chat_uid === item.tag_uid) {
            topIndex = index
          }
          item.last_msg = item.last_msg.replace(/&lf;/g, '\n').replace(/&add;/g, '+')
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

  // 获取照片弹窗提示
  getPhotoApply() {
    request(36).then(res => {
      console.log(res)
      if(res.error === 0 && res.type === 1) {
        this.photoApplyInfo = res
        this.setData({
          showDialog: true,
          content: res.nickname + '申请查看你的照片',
          buttons: res.have_photo ? [{text: '查看对方'}, {text: '允许查看'}] : [{text: '查看对方'}, {text: '去上传'}]
        })
      }  
    }).catch(err => {
      console.log(err)
    })
  },

  // 获取照片
  getPhoto(mid) {
    request(12).then(res => {
      if(res.error === 0) {
        if(res.photo.length > 0 && mid === this.photoApplyInfo.mid){
          this.photoApplyInfo.have_photo = true
          this.setData({
            buttons: [{text: '查看对方'}, {text: '允许查看'}]
          })
        }     
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

  clearTimeout() {
    if(timeout) {
      clearInterval(timeout)
      timeout = null
    }
    if(photoApply) {
      clearInterval(photoApply)
      photoApply = null
    }
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
  },

  // 关闭弹窗
  closeDialog() {
    this.setData({
      showDialog: false
    })
  },

  // 确认弹窗
  confirmDialog() {
    const photoApplyInfo = this.photoApplyInfo
    if(photoApplyInfo.have_photo) {
      request(26, {
        id: photoApplyInfo.id,
        type: 1,
      }).then(res => {
        console.log(res)
        if(res.error === 0) {
          this.setData({
            showDialog: false
          })
        }else {
          wx.showToast({
            title: res.msg,
            icon: 'none'
          })
        }
      }).catch(err => {
        console.log(err)
      })
    } else {
      app.setGlobal('showUploadPhoto', true)
      wx.switchTab({
        url: '/pages/profile/profile',
      })
    }
  },

  // 取消弹窗
  cancelDialog() {
    const photoApplyInfo = this.photoApplyInfo
    wx.navigateTo({
      url: '/pages/othersInfo/othersInfo?tagid=' + photoApplyInfo.tag_uid + '&mid=' + photoApplyInfo.mid,
    })
  },

})