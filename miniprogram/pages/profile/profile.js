const request = require('../../request.js')
import uploadPhotos from './uploadPhoto'
let educationArr = []
let incomeArr = []
Page({

  /**
   * 页面的初始数据
   */
  data: {
    photo: [],
    nickname: '',
    sex: 0,
    birthday: '',
    education: 0,
    huji: '',
    income: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function (options) {
    this.getPhoto()
    this.getSelectData()
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

  // 获取下拉数据
  getSelectData() {
    request(4, {
      types: 'education,income'
    }).then(data => {
      console.log(data)
      educationArr = data.education
      incomeArr = data.income
      this.getUserInfo() // 确保已经得到下拉数据
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

  // 获取基本信息
  getUserInfo() {
    request(5).then(res => {
      console.log(res)
      if(res.error === 0) {
        const {
          income,
          education
        } = res
        let [incomeIndex, educationIndex] = [0, 0]

        // 获取income，education在下拉表中的序号
        if (income !== -1) {
          for (let i = 0; i < incomeArr.length; i++) {
            const current = incomeArr[i]
            if (current.k === income) {
              incomeIndex = i
              break
            }
          }
        }

        if (education !== -1) {
          for (let i = 0; i < educationArr.length; i++) {
            const current = educationArr[i]
            if (current.k === education) {
              educationIndex = i
              break
            }
          }
        }
        this.setData({
          nickname: res.nickname,
          sex: res.sex === -1 ? 0 : res.sex,
          birthday: res.birthday,
          education: res.education === -1 ? 0 : educationArr[educationIndex].v,
          huji: res.huji,
          income: res.income === -1 ? 0 : incomeArr[incomeIndex].v,
        })
      }
    }).catch(err => {
      console.log(err)
    })
  },

  editInfo() {
    wx.navigateTo({
      url: '/pages/infoPrecent/infoPrecent',
    })
  },

  verified() {
    wx.navigateTo({
      url: '/pages/verified/verified',
    })
  },

  goSetting() {
    wx.navigateTo({
      url: '/pages/setting/setting',
    })
  },

  goRecharge() {
    wx.navigateTo({
      url: '/pages/recharge/recharge',
    })
  }
})