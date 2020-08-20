// miniprogram/pages/verification/verification.js
let timeout = null
let cacheInputValue = ''

Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputValue: '',
    timer: '发送',
    buttonDisabled: true,
    sendedNumber: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const phone = options.phone
    const length = phone.length
    const head = phone.slice(0, length - 8)
    const foot = phone.slice(length - 4, length)
    console.log(phone)
    this.setData({
      sendedNumber: head + '****' + foot
    })
  },

  // 输入验证码
  handleInput(e) {
    const value = e.detail.value
    const reg = /^\d{6}$/
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
      this.startTimeout()
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
    let num = 10
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
    console.log(cacheInputValue)
  }

})