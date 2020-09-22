const request = require('../../request.js')
const app = getApp()
import uploadPhotos from './uploadPhoto'
let educationArr = []
let incomeArr = []
Page({

  /**
   * 页面的初始数据
   */
  data: {
    photo: [],
    dateList: [],
    nickname: '',
    sex: 0,
    birthday: '',
    education: 0,
    huji: '',
    income: 0,
    gold: 0,
    showDialog: false,
    buttons: [{text: '关闭评价'}, {text: '提交'}],
    starNumObj: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function (options) {
    this.getPhoto()
    this.getSelectData()
    this.getDateInfo()
    this.getGold()
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

  // 获取金币数
  getGold() {
    request(30).then(res => {
      if(res.error === 0) {
        this.setData({
          gold: res.gold
        })
      }
    }).catch(err => {
      console.log(err)
    })
  },

  // 选择图片
	chooseImage() {
    const token = app.getGlobal('auth').token
    if(!token) {
      wx.navigateTo({
        url: '/pages/login/login',
      })
      return
    }
    
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

  // 获取约会记录
  getDateInfo() {
    request(27, {
      page: 1,
      size: 3,
      status: 0
    }).then(data => {
      console.log(data)
      if(data.error === 0) {
        const dateList = data.data
        dateList.forEach(item => {
          const datetime = item.datetime
          const datetimeArr = datetime.split('-')
          item.day = datetimeArr[2]
          item.month = datetimeArr[1]
        })
        this.setData({
          dateList
        })
      }
      
    }).catch(err => {
      console.log(err)
    })
  },

  // 跳转相应页面
  goPage(e) {
    const token = app.getGlobal('auth').token
    if(token) {
      const page = e.currentTarget.dataset.page
      wx.navigateTo({
        url: `/pages/${page}/${page}`,
      })
    }else {
      wx.navigateTo({
        url: '/pages/login/login',
      })
    }   
  },

  // button点击事件
  tapDialogButton(e) {
    const index = e.detail.index // 0左 1右
    if(index === 0) {
      this.setData({
        showDialog: false,
        starNumObj: {}
      })
    }else if(index === 1) {
      const keys = Object.keys(this.data.starNumObj)
      request(28, {
        score: keys.length,
        mid: this.mid,
      }).then(data => {
        if(data.error === 0) {
          this.setData({
            showDialog: false,
            starNumObj: {}
          })
        }        
      }).catch(err => {
        console.log(err)
      })
    }
  },

  selectStar(e) {
    const starNum = e.currentTarget.dataset.star
    const starNumObj = {}
    for(let i = 0; i <= starNum; i++) {
      starNumObj[i] = true
    }
    this.setData({
      starNumObj
    })
  },

  // 显示评分弹窗
  showScore(e) {
    const index = e.currentTarget.dataset.index
    const current = this.data.dateList[index]
    if(current.status === 5 && current.score === -1) {
      this.mid = current.mid
      this.setData({
        showDialog: true
      })
    }
  }
})