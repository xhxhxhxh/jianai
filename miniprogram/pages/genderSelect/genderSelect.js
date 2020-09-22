// miniprogram/pages/genderSelect/genderSelect.js
const request = require('../../request.js')
let gender
Page({

  /**
   * 页面的初始数据
   */
  data: {
    buttonDisabled: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  genderSelected(e) {
    gender = e.detail
    if(!gender.male && !gender.female) {
      this.setData({
        buttonDisabled: true
      })
    }else {
      this.setData({
        buttonDisabled: false
      })
    }
  },

  submit() {
    console.log(gender)
    request(3, {sex: gender.male ? 1 : 2}).then(res => {
      if(res.error === 0) {
        wx.navigateTo({
          url: '/pages/spouseInformation/spouseInformation'
        })
      }else {
        wx.showToast({
          title: res.msg,
          icon: 'none',
        })
      }
    }).catch(err => {
      console.log(err)
    })
   
  }
})