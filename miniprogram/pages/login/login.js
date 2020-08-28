// miniprogram/pages/login/login.js
const request = require('../../request.js')
let cacheInputValue = ''
Page({

  /**
   * 页面的初始数据
   */
  data: {
    countryCodes: ["+86", "+80", "+84", "+87"],
    countryCodeIndex: 0,
    buttonDisabled: true,
    inputValue: ''
  },

  // 输入手机号
  handleInput(e) {
    const value = e.detail.value
    const reg = /^1\d{10}$/
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