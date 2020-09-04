const request = require('../../request.js')
let spouseInfo = {}
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

  saveInfo() {
    request(3, userInfo).then(res => {
      console.log(res)
      if(res.error === 0) {
        wx.showToast({
          title: '修改成功',
          icon: 'success',
          duration: 2000
        })
      }
    }).catch(err => {
      console.log(err)
    })
  },

  getInformation(e) {
    spouseInfo = e.detail
    console.log(spouseInfo)
    let [totalNum, num] = [0, 0]
    for(let key in spouseInfo) {
      totalNum++
      if(spouseInfo[key]) {
        num++
      }
    }
    if(totalNum === num && num !== 0) {
      this.setData({
        buttonDisabled: false
      })
    } else {
      this.setData({
        buttonDisabled: true
      })
    }
  },

  saveInfo() {
    const data = {
      sex: spouseInfo.sex,
      age_min: spouseInfo.age[0],
      age_max: spouseInfo.age[1],
      height_min: spouseInfo.height[0],
      height_max: spouseInfo.height[1],
      education_min: spouseInfo.education[0],
      education_max: spouseInfo.education[1],
      income: spouseInfo.income,
      region: spouseInfo.locale
    }
    request(7, data).then(res => {
      console.log(res)
      if(res.error === 0) {
        wx.showToast({
          title: '修改成功',
          icon: 'success',
          duration: 2000
        })
      }
    }).catch(err => {
      console.log(err)
    })
  }
})