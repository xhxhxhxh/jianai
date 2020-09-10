// miniprogram/pages/match/match.js
let timer = null // 定时更换匹配文字
let matchTimer = null // 延迟匹配
let matchError = ''
const request = require('../../request.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    matching: false,
    loadingText: ['给你一个24小时的TA，能不能假戏真做就看你自己了', '嘘，别着急，静静等待，你的TA正在来的路上~'],
    loadingIndex: 0,
    showDialog: false,
    title: '择偶信息填写',
    content: '为了给您匹配更合适的TA，请填写择偶信息，然后再次匹配',
    buttons: [{text: '狠心离开'}, {text: '去填写'}],
    textColorPosition: [],
    contentTitle: '',
    showImage: false,
    showClose: false,
    imageSrc: '/images/img_tanchuang_shenqing@2x.png'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   
  },

  onShow: function() {
    if(matchError === -1401 || matchError === -1402 || matchError === -1403) {
      this.setData({
        buttons: [{text: '填写完成'}, {text: '去填写'}]
      })
    }
  },

  async startMatch() {
    request(14, {test: 18888888888}).then(res => {
      let error = matchError = res.error
      if(error === 0) {
        this.startTimer()
        this.setData({
          matching: true
        })
        matchTimer = setInterval(() => {
          if(this.data.matching) {
            this.getMatchInfo()
          }
        }, 3000)    
      }else if(error === -1401) {
        this.unverifiedDialog()
      }else if(error === -1402) {
        this.unBaseInfoDialog()
      }else if(error === -1403) {
        this.unSpouseInfoDialog()
      }else if(error === -1404) {
        this.isMatchingDialog()
      }
    }).catch(err => {
      console.log(err)
    })
  },

  // 获取匹配信息
  getMatchInfo() {
    request(16).then(res => {
      console.log(res)
      const {error, status, mid, tag_id} = res
      if(error === 0 && status === 2) {
        this.matchSuccessDialog(mid, tag_id)
      }
    }).catch(err => {
      console.log(err)
    })
  },

  stopMatch() {
    // request(15).then(res => {
    //   if(res.error === 0) {
    //     this.matchSuccessDialog()
    //   }
    // }).catch(err => {
    //   console.log(err)
    // })
    this.stopTimer()
    this.setData({
      matching: false,
      loadingIndex: 0
    })
    this.clesrMatchingInterval()
  },

  // 清除match定时器
  clesrMatchingInterval() {
    if(matchTimer) {
      clearInterval(matchTimer)
      matchTimer = null
    }
  },

  startTimer() {
    if(!timer) {
      timer = setInterval(() => {
        let {loadingText, loadingIndex} = this.data
        const length = loadingText.length - 1
        loadingIndex++
        if(loadingIndex > length) {
          loadingIndex = 0
        }
        this.setData({
          loadingIndex
        })
      }, 5000)
    }
  },

  stopTimer() {
    if(timer) {
      clearInterval(timer)
      timer = null
    }
  },

  // 关闭弹窗
  closeDialog() {
    this.setData({
      showDialog: false
    })
  },

  // 确认弹窗
  confirmDialog() {
    console.log("确认")
  },

  // 取消弹窗
  cancelDialog() {
    this.setData({
      showDialog: false
    })
  },

  // 匹配成功弹窗
  matchSuccessDialog(mid, tagid) {
    this.setData({
      showDialog: true,
      matching: false,
      title: '',
      contentTitle: '恭喜你!',
      content: '在心动信号的帮助下，完成了一次配对',
      buttons: [{text: '查看主页'}, {text: '进入聊天'}],
      textColorPosition: [],
      showImage: true,
      showClose: true,
      imageSrc: '/images/img_pipei@2x.png'
    })
    this.confirmDialog = function() {
      wx.navigateTo({
        url: '/pages/chat/chat?tagid=' + tagid,
      })
    }
    this.cancelDialog = function() {
      this.setData({
        showDialog: false
      })
      wx.navigateTo({
        url: '/pages/othersInfo/othersInfo?mid=' + mid + '&tagid=' + tagid,
      })
    }
    this.clesrMatchingInterval()
  },

  // 未实名弹窗
  unverifiedDialog() {
    this.setData({
      showDialog: true,
      title: '实名认证',
      contentTitle: '',
      content: '为了促进双方线下约会，请先完成实名认证',
      buttons: [{text: '狠心离开'}, {text: '去填写'}],
      textColorPosition: [],
      showImage: false,
      showClose: false,
      imageSrc: ''
    })
    this.confirmDialog = function() {
      wx.navigateTo({
        url: '/pages/verified/verified',
      })
    }
    this.cancelDialog = function() {
      this.setData({
        showDialog: false
      })
    }
  },

  // 未填写基本信息弹窗
  unBaseInfoDialog() {
    this.setData({
      showDialog: true,
      title: '基础信息填写',
      contentTitle: '',
      content: '为了给您匹配更合适的TA，请填写基础信息，然后再次匹配',
      buttons: [{text: '狠心离开'}, {text: '去填写'}],
      textColorPosition: [],
      showImage: false,
      showClose: false,
      imageSrc: ''
    })
    this.confirmDialog = function() {
      wx.navigateTo({
        url: '/pages/baseInfo_edit/baseInfo_edit',
      })
    }
    this.cancelDialog = function() {
      this.setData({
        showDialog: false
      })
    }
  },

  // 未填写择偶信息弹窗
  unSpouseInfoDialog() {
    this.setData({
      showDialog: true,
      title: '择偶信息填写',
      contentTitle: '',
      content: '为了给您匹配更合适的TA，请填写择偶信息，然后再次匹配',
      buttons: [{text: '狠心离开'}, {text: '去填写'}],
      textColorPosition: [],
      showImage: false,
      showClose: false,
      imageSrc: ''
    })
    this.confirmDialog = function() {
      wx.navigateTo({
        url: '/pages/spouseInformation/spouseInformation',
      })
    }
    this.cancelDialog = function() {
      this.setData({
        showDialog: false
      })
    }
  },

   // 正在匹配中弹窗
   isMatchingDialog() {
    this.setData({
      showDialog: true,
      title: '正在匹配中',
      contentTitle: '',
      content: '正在匹配中,请稍后再试',
      buttons: [{text: '取消'}, {text: '确定'}],
      textColorPosition: [],
      showImage: false,
      showClose: false,
      imageSrc: ''
    })
    this.confirmDialog = function() {
      this.setData({
        showDialog: false
      })
    }
    this.cancelDialog = function() {
      this.setData({
        showDialog: false
      })
    }
  }
})