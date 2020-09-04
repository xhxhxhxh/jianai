const request = require('../../request.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    base_rate: 0,
    detail_rate: 0,
    spouse_rate: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  onShow: function() {
    this.getInfoPrecent()
  },

  onUnload() {
		const pages = getCurrentPages()
		const prevPage = pages[pages.length - 2]
		if(prevPage && prevPage.route === "pages/profile/profile") {
			prevPage.getUserInfo()
		}
	},

  // 获取信息百分比
  getInfoPrecent() {
    request(11).then(res => {
      console.log(res)
      if(res.error === 0) {
        this.setData({
          base_rate: res.base_rate,
          detail_rate: res.detail_rate,
          spouse_rate: res.spouse_rate
        })
      }
    }).catch(err => {
      console.log(err)
    })
  },

  skipToEdit(e) {
    const page = e.currentTarget.dataset.page
    wx.navigateTo({
      url: '/pages/' + page + '/' + page,
    })
  }
})