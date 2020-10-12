const request = require('../../request.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function (options) {
    this.getData()
  },

  onPullDownRefresh: function() {
    this.getData()
  },

  getData() {
    request(19).then(res => {
      console.log(res)
      wx.stopPullDownRefresh()
      if(res.error === 0) {
        this.setData({
          list: res.data
        })
      }
    }).catch(err => {
      wx.stopPullDownRefresh()
      console.log(err)
    })
  },

  checkOthers(e) {
    const mid = e.currentTarget.dataset.mid
    const tagid = e.currentTarget.dataset.tagid
    wx.navigateTo({
      url: '/pages/othersInfo/othersInfo?mid=' + mid + '&tagid=' + tagid,
    })
  },

  ignore(e) {
    const mid = e.currentTarget.dataset.mid
    const index = e.currentTarget.dataset.index
    request(18, {mid}).then(res => {
      console.log(res)
      if(res.error === 0) {
        const list = [...this.data.list]
        list.splice(index, 1)
        this.setData({
          list
        })
      }
    }).catch(err => {
      console.log(err)
    })
  }
})