// miniprogram/pages/match/match.js
let timer = null
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

  startMatch() {
    this.startTimer()
    this.setData({
      matching: true
    })
  },

  stopMatch() {
    this.stopTimer()
    this.setData({
      matching: false,
      loadingIndex: 0
    })
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
    console.log("取消")
  },
})