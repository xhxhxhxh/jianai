const request = require('../../request.js')

const rechargeList = [
  {
    id: 1,
    gold: 210,
    money: 68.00
  },
  {
    id: 2,
    gold: 210,
    money: 68.00
  },
  {
    id: 3,
    gold: 210,
    money: 68.00
  },
  {
    id: 4,
    gold: 210,
    money: 68.00
  },
  {
    id: 5,
    gold: 210,
    money: 68.00
  },
  {
    id: 6,
    gold: 210,
    money: 68.00
  },
]
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bannerUrl: '',
    navigationBackground: '',
    statusBarHeight: 0,
    selectedId: '',
    rechargeList
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getBannerImage()
    this.getRechargeList()
    // this.getNavigationHeight()
    const query = wx.createSelectorQuery()
    query.select('.navigation-container').boundingClientRect((res) => {
      this.setData({
        statusBarHeight: res.height
      })
    }).exec()
  },

  // 从云存储中获取图片
  getBannerImage() {
    wx.cloud.getTempFileURL({
      fileList: ['cloud://dev-sw74b.6465-dev-sw74b-1302913306/images/img_chongzhi_banner@2x.png'],
      success: res => {
        const url = res.fileList[0].tempFileURL
        this.setData({
          bannerUrl: url,
          navigationBackground: `url(${url}) no-repeat top center`
        })
      },
      fail: console.error
    })
  },

  rechargeSelected(e) {
    const id = e.currentTarget.dataset.id
    this.setData({
      selectedId: id
    })
  },

  // 获取内购信息
  getRechargeList() {
    request(29).then(res => {
      console.log(res)
      if(res.error === 0) {
        this.setData({
          priceList: res
        })
      }
    }).catch(err => {
      console.log(err)
    })
  },

  // 获取系统信息取得导航栏高度
  // getNavigationHeight() {
  //   const system = wx.getSystemInfoSync();
  //   console.log(system)
  //   let isIOS = system.platform === 'ios';
  //   let statusBarHeight = system.statusBarHeight
  //   this.setData({
  //     isIOS,
  //     statusBarHeight
  //   })
  // }
})