// miniprogram/pages/dateInfo/dateInfo.js
const request = require('../../request.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabCur: 0,
    tabData: ['全部', '进行中', '已结束', '已拒绝'],
    color: '#FF4F4C',
    size: 78,
    dateList: [],
    showDialog: false,
    starNumObj: {},
    buttons: [{text: '关闭评价'}, {text: '提交'}],
    showAll: true, // 显示全部记录
    status: 2
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.cachePage = 1
    this.getDateInfo()
  },

  onReachBottom: function () {
    this.cachePage++
    this.getDateInfo()
  },

  // 获取约会记录
  getDateInfo() {
    request(27, {
      page: this.cachePage,
      size: 10,
      status: 0
    }).then(data => {
      console.log(data)
      if (data.error === 0) {
        let dateList = data.data
        dateList.forEach(item => {
          const datetime = item.datetime
          const datetimeArr = datetime.split('-')
          item.day = datetimeArr[2]
          item.month = datetimeArr[1]
        })
       
        this.setData({
          dateList: this.data.dateList.concat(dateList)
        })
      }

    }).catch(err => {
      console.log(err)
    })
  },

  // button点击事件
  tapDialogButton(e) {
    const index = e.detail.index // 0左 1右
    if (index === 0) {
      this.setData({
        showDialog: false,
        starNumObj: {}
      })
    } else if (index === 1) {
      const keys = Object.keys(this.data.starNumObj)
      request(28, {
        score: keys.length,
        mid: this.mid,
      }).then(data => {
        if (data.error === 0) {
          this.setData({
            showDialog: false,
            starNumObj: {}
          })
        }else {
          wx.showToast({
            title: data.msg,
            icon: 'none'
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
    for (let i = 0; i <= starNum; i++) {
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
    if (current.status === 5 && current.score === -1) {
      this.mid = current.mid
      this.setData({
        showDialog: true
      })
    }
  },

  tabChange(e) {
    const index = e.detail.index
    if(index === 0) {
      this.setData({
        showAll: true
      })
    }else if(index === 1) {
      this.setData({
        showAll: false,
        status: 2
      })
    }else if(index === 2) {
      this.setData({
        showAll: false,
        status: 5
      })
    }else if(index === 3) {
      this.setData({
        showAll: false,
        status: 4
      })
    }
  }
})