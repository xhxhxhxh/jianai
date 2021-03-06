const app = getApp()
const request = require('../../request.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    noticeReceive: true,
    showDialog: false,
    title: '退出登录',
    isLogin: false,
    content: '退出登录将无法收到信息，是否继续退出',
    buttons: [{text: '取消'}, {text: '继续退出'}],
    verified: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getUserInfo()
    // 检测是否登录
    const auth = app.getGlobal('auth')

    // 获取本地接受推送的设置
    let noticeReceive = wx.getStorageSync('noticeReceive')
    if(noticeReceive !== 1 && noticeReceive !== 0) {
      noticeReceive = 1
    }

    if(auth.token) {
      this.setData({
        isLogin: true,
        noticeReceive: !!noticeReceive
      })
    }else {
      this.setData({
        isLogin: false,
        noticeReceive: !!noticeReceive
      })
    }
  },

  noticeReceiveChange(e) {
    const noticeReceive = e.detail.value
    wx.setStorage({
      data: noticeReceive ? 1 : 0,
      key: 'noticeReceive',
    })
  },

  // 检查更新
  update() {
    const updateManager = wx.getUpdateManager()
    // 检测版本更新
    updateManager.onCheckForUpdate((res)=>{
      if (res.hasUpdate){
        updateManager.onUpdateReady(()=>{
          wx.showModal({
            title: '更新提示',
            content: '发现新版本，是否立即更新',
            success(res){
              if(res.confirm){
                updateManager.applyUpdate()
              }
            }
          })
        })
      }
    })
  },

  // 退出登录
  logout() {
    if(this.data.isLogin) {
      this.setData({
        showDialog: true
      })
    }else {
      wx.redirectTo({
        url: '/pages/login/login',
      })
    }
  },

  // 确认退出
  confirmDialog() {
    wx.removeStorage({
      key: 'auth',
      success: (res) => {
        app.setGlobal('auth', '')
        wx.reLaunch({
          url: '/pages/login/login',
        })
      }
    })
  },

  // 取消弹窗
  cancelDialog() {
    this.setData({
      showDialog: false
    })
  },

  goVerified() {
    wx.navigateTo({
      url: '/pages/verified/verified',
    })
  },

  // 查询是否实名认证
  getUserInfo() {
    request(5).then(res => {
      console.log(res)
      if(res.error === 0) {
        if(res.birthday) {
          this.setData({
            verified: true
          })
        }
      }
    }).catch(err => {
      console.log(err)
    })
  },
})