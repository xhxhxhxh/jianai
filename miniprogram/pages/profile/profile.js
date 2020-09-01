const request = require('../../request.js')
import uploadPhotos from './uploadPhoto'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    photo: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getPhoto()
  },


  // 跳转编辑照片页
  goEditPhoto() {
    wx.navigateTo({
      url: '/pages/editPhoto/editPhoto',
    })
  },

  // 获取照片
  getPhoto() {
    request(12).then(res => {
      if(res.error === 0) {
        this.setData({
          photo: res.photo
        })
      }
    }).catch(err => {
      console.log(err)
    })
  },

  // 选择图片
	chooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      success: (res) => {
        uploadPhotos(res.tempFilePaths, (data) => {
          const photo = this.data.photo
          photo.unshift({img: data.path})
          console.log(photo)
          this.setData({
            photo
          })
        })
      },
    })
  },
})