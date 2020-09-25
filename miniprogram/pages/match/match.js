// miniprogram/pages/match/match.js
let timer = null // 定时更换匹配文字
let matchTimer = null // 延迟匹配
let matchError = ''
const request = require('../../request.js')
const app = getApp()
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
    imageSrc: '/images/img_tanchuang_shenqing@2x.png',
    remainMatchNum: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   this.getRemainMatchNum()
  },

  onShow: function() {
    if(matchError === -1401 || matchError === -1402 || matchError === -1403) {
      const dataComplete = app.getGlobal('dataComplete')
      if(dataComplete) {
        this.setData({
          showDialog: false
        })
      }    
    }
    if(matchError === -1406) {
      this.setData({
        buttons: [{text: '充值完成'}, {text: '去充值'}]
      })
    }
  },

  async startMatch() {
    const data = {test: 17363566010}
    if(this.buy) {
      data.buy = true
    }
    request(14, data).then(res => {
      let error = matchError = res.error
      if(error === 0) {
        this.startTimer()
        const info = {
          matching: true,
        }
        this.setData(info)
        matchTimer = setInterval(() => {
          if(this.data.matching) {
            this.getMatchInfo()
          }
        }, 3000)    
      }else if(error === -1401) {
        app.setGlobal('dataComplete', false)
        this.unverifiedDialog()
      }else if(error === -1402) {
        app.setGlobal('dataComplete', false)
        this.unBaseInfoDialog()
      }else if(error === -1403) {
        app.setGlobal('dataComplete', false)
        this.unSpouseInfoDialog()
      }else if(error === -1404) {
        this.isMatchingDialog()
      }else if(error === -1405) {
        this.needBuyDialog(res.need_gold)
      }else if(error === -1406) {
        this.payFail()
      }else if(error === -10006) {
        this.needLogin()
      }
    }).catch(err => {
      console.log(err)
    })
  },

  // 获取剩余匹配数
  getRemainMatchNum() {
    request(30).then(res => {
      if(res.error === 0) {
        console.log(res)
        this.setData({
          remainMatchNum: res.left_count
        })
      }
    }).catch(err => {
      console.log(err)
    })
  },

  // 获取匹配信息
  getMatchInfo() {
    request(16).then(res => {
      console.log(res)
      const {error, status, mid, tag_id, nickname} = res
      if(error === 0 && status === 2) {
        this.matchSuccessDialog(mid, tag_id, nickname)
        this.setData({
          remainMatchNum: this.data.remainMatchNum <= 0 ? 0 : this.data.remainMatchNum - 1
        })
      }
    }).catch(err => {
      console.log(err)
    })
  },

  stopMatch() {
    request(15).then(res => {
      console.log(res)
      if(res.error === 0 ) {
        this.stopTimer()
        this.setData({
          matching: false,
          loadingIndex: 0
        })
        this.clearMatchingInterval()
      }
    }).catch(err => {
      console.log(err)
    })  
  },

  // 清除match定时器
  clearMatchingInterval() {
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
  matchSuccessDialog(mid, tagid, nickname) {
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
        url: '/pages/chat/chat?tagid=' + tagid + '&userName=' + nickname,
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
    this.clearMatchingInterval()
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

  // 未登录弹窗
  needLogin() {
    this.setData({
      showDialog: true,
      title: '未登录',
      contentTitle: '',
      content: '您需要登录后才可以匹配',
      buttons: [{text: '取消'}, {text: '去登录'}],
      textColorPosition: [],
      showImage: false,
      showClose: false,
      imageSrc: ''
    })
    this.confirmDialog = function() {
      wx.navigateTo({
        url: '/pages/login/login',
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
  },

  // 需要支付金币弹窗
  needBuyDialog(gold) {
    this.setData({
      showDialog: true,
      title: '增加匹配次数',
      contentTitle: '',
      content: `将消耗${gold}金币，增加您的匹配次数，每周都有免费次数，是否增加？`,
      buttons: [{text: '狠心离开'}, {text: '支付'}],
      textColorPosition: [3, 5],
      showImage: false,
      showClose: false,
      imageSrc: ''
    })
    this.confirmDialog = function() {
      this.buy = true
      this.startMatch(true)
      this.buy = false
      this.setData({
        showDialog: false
      })
    }
    this.cancelDialog = function() {
      this.setData({
        showDialog: false
      })
    }
  },

  // 支付失败弹窗
  payFail() {
    this.setData({
      showDialog: true,
      title: '支付失败',
      contentTitle: '',
      content: `金币不足，无法支付`,
      buttons: [{text: '取消'}, {text: '去充值'}],
      textColorPosition: [],
      showImage: false,
      showClose: false,
      imageSrc: ''
    })
    this.confirmDialog = function() {
      wx.navigateTo({
        url: '/pages/recharge/recharge',
      })
    }
    this.cancelDialog = function() {
      this.setData({
        showDialog: false
      })
    }
  }
})