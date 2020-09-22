let mid = ''
let tagid = ''
const request = require('../../request.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    age: '',
    age_max: '',
    age_min: '',
    belief: '',
    car: '',
    company: '',
    drink: '',
    education: '',
    education_max: '',
    education_min: '',
    food: [],
    have_children: '',
    height: '',
    height_max: '',
    height_min: '',
    house: '',
    income: '',
    introduction: "",
    job: "",
    nation: '',
    nickname: "",
    photo: [],
    region: "",
    school: "",
    smoke: '',
    sport: [],
    travel: [],
    wanna_children: '',
    wedding: '',
    spouse_income: '',
    spouse_region: "",
    weight: '',  
    incomeObj: {},
    educationObj: {},
    houseObj: {},
    carObj: {},
    nationObj: {},
    beliefObj: {},
    companyObj: {},
    smokeObj: {},
    drinkObj: {},
    have_childrenObj: {},
    wanna_childrenObj: {},
    weddingObj: {},
    duration: 300,
    lock_photo: true,
    showDialog: false,
    bannerUrl: 'https://6465-dev-sw74b-1302913306.tcb.qcloud.la/images/img_zhuye_moren%402x.png',
    swiperIndex: 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    mid = options.mid
    tagid = options.tagid
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    this.getSelectData()
  },

  onPullDownRefresh: function () {
    this.getUserInfo()
  },

  getUserInfo() {
    request(17, {mid}).then(res => {
      console.log(res)
      wx.stopPullDownRefresh()
      if(res.error === 0) {
        wx.hideLoading()  
        const info = {
          ...res,
          sport: res.sport ? res.sport.split(',') : [],
          food: res.food ? res.food.split(',') : [],
          travel: res.travel ? res.travel.split(',') : [],
        }
        delete info.error
        delete info.msg
        this.setData(info)
      }
     
    }).catch(err => {
      console.log(err)
      wx.stopPullDownRefresh()
    })
  },

  getSelectData() {
    request(4, {
      types: 'income,education,house,car,nation,belief,company,smoke,drink,have_children,wanna_children,wedding'
    }).then(data => {
      console.log(data)
      const oldData = {
        income: data.income,
        education: data.education,
        house: data.house,
        car: data.car,
        nation: data.nation,
        belief: data.belief,
        company: data.company,
        smoke: data.smoke,
        drink: data.drink,
        have_children: data.have_children,
        wanna_children: data.wanna_children,
        wedding: data.wedding,
      }
      const info = {}

      // 将数组转化成对象
      for(let key in oldData) {
         const cache = {}
        oldData[key].forEach(item => {
          cache[item.k] = item.v
        })
        info[key + 'Obj'] = cache
      }

      this.setData(info)
      this.getUserInfo() // 确保已经得到下拉数据
    }).catch(err => {
      console.log(err)
    })
  },

  // 获取照片
  applyPhoto() {
    request(25, {mid}).then(res => {
      if(res.error === 0) {
        this.setData({
          showDialog: true
        })
        setTimeout(() => {
          this.setData({
            showDialog: false
          })
        }, 2000)
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

  cancel() {
    wx.navigateBack({
      fail() {
        wx.switchTab({
          url: '/pages/match/match',
        })
      }
    })
  },

  goChat() {
    wx.navigateTo({
      url: '/pages/chat/chat?tagid=' + tagid + '&userName=' + this.data.nickname,
    })
  },

  // 获取选中的轮播图
  swiperChange(e) {
    this.setData({
      swiperIndex: e.detail.current + 1
    })
  },

  // 预览照片
  onPreviewImage(event) {
    const current = event.currentTarget.dataset.img
    wx.previewImage({
      current, // 当前显示图片的http链接
      urls: this.data.photo
    })
  },
})