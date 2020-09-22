const request = require('../../request.js')
let userInfo = {}
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

  // 获取用户数据
  sendUserInfo(e) {
    userInfo = e.detail
    console.log(userInfo)
    let [totalNum, num] = [0, 0]
    for(let key in userInfo) {
      totalNum++
      if(userInfo[key]) {
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
    request(3, userInfo).then(res => {
      console.log(res)
      if(res.error === 0) {
        wx.showToast({
          title: '修改成功',
          icon: 'success',
          duration: 2000
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