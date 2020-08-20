// miniprogram/pages/genderSelect/genderSelect.js
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
  }
})