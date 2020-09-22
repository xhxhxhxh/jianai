// miniprogram/pages/verification/verification.js
let timeout = null
let cacheInputValue = ''
const request = require('../../request.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputValue: '',
    timer: '发送',
    buttonDisabled: true,
    sendedNumber: '',
    _phone: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const phone = options.phone
    const length = phone.length
    const head = phone.slice(0, length - 8)
    const foot = phone.slice(length - 4, length)
    this.setData({
      sendedNumber: head + '****' + foot
    })
    this.data._phone = phone.substr(3)
    this.sendVerificationCode()
  },

  // 输入验证码
  handleInput(e) {
    const value = e.detail.value
    const reg = /^\d{4}$/
    cacheInputValue = value
    if(reg.test(value)) {
      this.setData({
        buttonDisabled: false
      })
    }else {
      this.setData({
        buttonDisabled: true
      })
    }
  },

  // 发送验证码
  sendVerificationCode() {
    if(!timeout) {
      request(2, {
        mobile: this.data._phone
      }).then(data => {
        if(data.error === 0) {
          this.startTimeout()
        }else {
          wx.showToast({
            title: data.msg,
            icon: 'none'
          })
        }
      }).catch(err => {
        console.log(err)
      })
    }else {
      wx.showToast({
        title: '验证码已发送，请稍后再试',
        icon: 'none',
        duration: 2000
      })
    }
  },

  // 倒计时
  startTimeout() {
    let num = 60
    timeout = setInterval(() => {
      num--
      if(num < 0) {
        this.setData({
          timer: '重新获取'
        })
        clearInterval(timeout)
        timeout = null
      }else {
        this.setData({
          timer: num + 's'
        })
      }
    }, 1000)
  },

  // 验证
  submit() {
    request(1, {
      mobile: this.data._phone,
      code: cacheInputValue
    }).then(data => {
      console.log(data)
      if(data.error === 0) {
        const auth = app.getGlobal('auth')
        auth.token = data.token
        auth.uid = data.uid
        app.setGlobal('auth', auth)
        wx.setStorage({
          data: auth,
          key: 'auth',
        })
        if(data.register) {
          wx.navigateTo({
            url: '/pages/genderSelect/genderSelect',
          })
        }else {
          wx.reLaunch({
            url: '/pages/match/match',
          })
        }      
      }else {
        wx.showToast({
          title: data.msg,
          icon: 'none'
        })
      }
    }).catch(err => {
      console.log(err)
    })
  }

})