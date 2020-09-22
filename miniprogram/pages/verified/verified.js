let name = ''
let idCard = ''
const request = require('../../request.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: '',
    idCard: '',
    showDialog: false,
    buttons: [{text: '完善信息'}, {text: '去匹配'}],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    name = ''
    idCard = ''
  },

  onUnload() {
		// const pages = getCurrentPages()
		// const prevPage = pages[pages.length - 2]
		// if(prevPage && prevPage.route === "pages/profile/profile") {
		// 	prevPage.getUserInfo()
		// }
	},

  handleNameChange(e) {
    name = e.detail.value
  },

  handleIdChange(e) {
    idCard = e.detail.value
  },

  saveInfo() {
    const reg = /^\d{18}$/
    let warn = ''
    if(!reg.test(idCard)) {
      warn = '身份证格式错误'
    }
    if(!name) {
      warn = '请填写姓名'
    }
    if(warn) {
      wx.showToast({
        title: warn,
        icon: 'none'
      })
      return
    }

    request(10, {name, id_card: idCard}).then(res => {
      if(res.error === 0) {      
        this.setData({
          showDialog: true
        })
      }else {      
        wx.showToast({
          title: res.msg,
          icon: 'none'
        })
      }
    }).catch(err => {
      console.log(err)
    })
  },

  // 确认弹窗
  confirmDialog() {
    wx.switchTab({
      url: '/pages/match/match',
    })
  },

  // 取消弹窗
  cancelDialog() {
    wx.navigateTo({
      url: '/pages/infoPrecent/infoPrecent',
    })
  },

  closeDialog() {
    this.setData({
      showDialog: false
    })
  }
})