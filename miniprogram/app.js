//app.js
const request = require('./request')
const dayjs = require('dayjs')
App({
  onLaunch: function () {
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'dev-sw74b',
        traceUser: true,
      })
    }

    this.globalData = {
      scale: 1,
      dataComplete: false, // 匹配失败时，跳转页面完成信息填写后为true
      showUploadPhoto: false // 自动弹出上传照片按钮
    }

    this.loadLocalInfo()
    this.getServerTime()
    this.getScreenScale()
    let auth = this.getGlobal('auth')
    if(!auth.token) {
      wx.redirectTo({
        url: '/pages/login/login',
      })
    }
    
  },

  // 获取服务器时间
  getServerTime() {
    request(0, null, 'GET', this).then(data => {
      console.log(data)
      const serverTime = data.server_time
      const time = {
        localTime: dayjs().format(),
        serverTime
      }
      wx.setStorage({
        data: time,
        key: 'time',
      })
    }).catch(err => {
      console.log(err)
    })
  },

  // 将本地缓存读取到global
  loadLocalInfo() {
    let auth = wx.getStorageSync('auth')
    let time = wx.getStorageSync('time')
    this.setGlobal('auth', auth)
    this.setGlobal('time', time)
  },

  // 设置global值
  setGlobal(key, value) {
    this.globalData[key] = value
  },

  // 获取global的值
  getGlobal(key) {
    return this.globalData[key]
  },

  // 获取屏幕放大倍数
  getScreenScale() {
    // 获取屏幕宽度，计算钩子的放大倍数
    wx.getSystemInfo({
      success: (result) => {
        const screenWidth = result.screenWidth
        this.setGlobal('scale', screenWidth / 375)
      },
    })
  }
})

