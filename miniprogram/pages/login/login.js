// miniprogram/pages/login/login.js
const app = getApp()
let cacheInputValue = ''
Page({

  /**
   * 页面的初始数据
   */
  data: {
    countryCodes: ["+86", "+80", "+84", "+87"],
    countryCodeIndex: 0,
    buttonDisabled: true,
    inputValue: '',
    scale: app.getGlobal('scale')
  },

  onLoad () {
    console.log(app.getGlobal('scale'))
    this.setData({
      scale: app.getGlobal('scale')
    })
  },

  // 输入手机号
  handleInput(e) {
    const value = e.detail.value
    const reg = /^1\d{10}$/
    cacheInputValue = value
    if(reg.test(value)) {
      this.setData({
        buttonDisabled: false,
        inputValue: value
      })
    }else {
      this.setData({
        buttonDisabled: true,
        inputValue: value
      })
    }
  },

  // 区号选择
  bindCountryCodeChange(e) {
    this.setData({
      countryCodeIndex: e.detail.value
    })
  },

  // 清空输入
  clearNumber() {
    cacheInputValue = ''
    this.setData({
      inputValue: '',
      buttonDisabled: true
    })
  },

  // 发送验证码
  submit() {
    const {countryCodes, countryCodeIndex} = this.data
    const phone = countryCodes[countryCodeIndex] + cacheInputValue
    wx.navigateTo({
      url: '/pages/verification/verification?phone=' + phone,
    })
  }
})