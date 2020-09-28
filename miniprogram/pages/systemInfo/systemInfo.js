const request = require('../../request.js')

const dayjs = require('dayjs')
require('dayjs/locale/zh-cn')
const calendar = require('dayjs/plugin/calendar')
dayjs.extend(calendar)

let tagid = -99
let applyPhotoFlag = true // 防止多次申请
let getNewInfoFlag = true 
let cachePage = 1
let scrollBottom = 0
let timeout = null
let index = 2
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lineHeight: 24,
    comment: '',
    emojiSource: 'https://res.wx.qq.com/op_res/eROMsLpnNC10dC40vzF8qviz63ic7ATlbGg20lr5pYykOwHRbLZFUhgg23RtVorX',
    historyList:[],
    layoutHeight: '0px',
    copyHistoryList: [], // 用于计算聊天区域高度
    showCopyScrollContainer: false,
    scrollTop: 0,
    showLoading: false,
    scrollIntoView: '', // 控制滚动到的元素id
    timeObj: {} // 记录聊天时间
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.timeObj = {}
    this.cacheHistoryList = []
    applyPhotoFlag = true
    getNewInfoFlag = true
    cachePage = 1
    scrollBottom = 0
    this.getChatInfo()
    this.getDiffTime()
    const emojiInstance = this.selectComponent('.mp-emoji')
    this.emojiNames = emojiInstance.getEmojiNames()
    this.parseEmoji = emojiInstance.parseEmoji;
    let layoutHeight = wx.getSystemInfoSync().windowHeight;
    this.setData({
      layoutHeight,
    })
  },

  onUnload() {
    this.clearTimeout()
  },

  clearTimeout() {
    if(timeout) {
      clearInterval(timeout)
      timeout = null
    }
  },

  // 获取聊天记录
  async getChatInfo(addToTop) {
    if(addToTop){
      await this.sleep(1500)
    }
    request(22, {
      page: cachePage,
      size: 10,
      tag_uid: tagid
    }).then(res => {
      console.log(res)
      getNewInfoFlag = true
      if(res.error === 0) {
        let historyList = [...this.data.historyList] 
        let cacheHistoryList = [...res.data] // 缓存原始数据，防止出现自己的好友申请
        let newInfo = res.data
        if(newInfo.length === 0) {
          if(addToTop) cachePage--
          this.setData({
            showLoading: false
          })
          return
        }

        newInfo = newInfo.filter(item => {
          item.numid = item.id
          item.id = 'emoji_' + item.id
          if(item.type === 1) {
            item.emoji = this.parseEmoji(item.content)
          }
          if(item.type === 2) {
            item.imageSrc = item.content
          }
          return item.type === 1 || item.type === 2 || (item.type === 3 && item.from === 2) || item.type === 4
        })
        newInfo.reverse()
        cacheHistoryList.reverse()
        this.calculateTime(newInfo)
        const data = {
          timeObj: {...this.timeObj}
        }
        if(addToTop) {
          this.cacheHistoryList = cacheHistoryList.concat(this.cacheHistoryList)
          data.copyHistoryList = newInfo.concat(historyList)
          data.showCopyScrollContainer = true
        }else {
          this.cacheHistoryList = cacheHistoryList
          data.historyList = historyList.concat(newInfo)
          data.scrollIntoView = data.historyList[data.historyList.length - 1].id
          data.showLoading = false
        }
       
        this.setData(data, async () => {
          if(addToTop) {
            const res = await this.getCopyScrollHeight()
            const scrollViewInfo = await this.getScrollViewInfo()
            const start_scroll = scrollViewInfo.scrollTop <= 0 ? -20 : scrollViewInfo.scrollTop;
            scrollBottom = this.inner_height - start_scroll
            const scrollTop = res.height - scrollBottom
            console.log(res.height,scrollBottom)
            this.setData({
              scrollTop: scrollTop === this.data.scrollTop ? scrollTop + 0.01 : scrollTop,
              historyList: [...data.copyHistoryList],
              showCopyScrollContainer: false,
              showLoading: false
            })  
          }     
        })
        if(!addToTop){
          timeout = setInterval(this.getNewMessage, 2000)
        }
      }
    }).catch(err => {
      console.log(err)
      getNewInfoFlag = true
    })
  },

  // 休眠，用于延迟获取旧聊天记录
  sleep(time) {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, time)
    })
  },

  // 获取最新聊天数据
  getNewMessage() {
    let historyList = [...this.data.historyList]
    request(23, {
      last_msg_id: this.cacheHistoryList[this.cacheHistoryList.length - 1].numid,
      tag_uid: tagid,
    }).then(res => {
      console.log(res)
      if(res.error === 0) {
        let newInfo = res.data
        let cacheHistoryList = [...res.data]
        if(newInfo.length > 0) {
          newInfo = newInfo.filter(item => {
          item.numid = item.id
          item.id = 'emoji_' + item.id
          if(item.type === 1) {
            item.emoji = this.parseEmoji(item.content)
          }
          if(item.type === 2) {
            item.imageSrc = item.content
          }
          return item.type === 1 || item.type === 2 || (item.type === 3 && item.from === 2) || item.type === 4
        })
        newInfo.reverse()
        cacheHistoryList.reverse()
        this.calculateTime(newInfo)
        this.cacheHistoryList = this.cacheHistoryList.concat(cacheHistoryList)
        historyList = historyList.concat(newInfo)
        this.setData({
          historyList,
          scrollIntoView: historyList[historyList.length - 1].id,
          timeObj: {...this.timeObj}
        })
       }
      }
    }).catch(err => {
      console.log(err)
    })
  },

  // 计算聊天时间
  calculateTime(data, send) { // 从输入框添加的内容需传递send参数
    let historyList = this.data.historyList
    let originTime = dayjs(data[0].datetime)
    const timeObj = this.timeObj
    if(send && historyList.length > 0) {
      originTime = dayjs(historyList[historyList.length - 1].datetime)
    }else {
      timeObj[data[0].numid] = {
        type: 4,
        time: this.formatTime(data[0].datetime)
      }
    }
    
    data.forEach(item => {
      const currentTime = dayjs(item.datetime)
      if(currentTime.diff(originTime, 'm') > 5) {
        timeObj[item.numid] = {
          type: 4,
          time: this.formatTime(item.datetime)
        }
      }
      originTime = dayjs(item.datetime)
    })
  },

  // 获取与服务器时间的差值
  getDiffTime() {
    const time = wx.getStorageSync('time')
    const localTime = dayjs(time.localTime)
    const serverTime = dayjs(time.serverTime)
    this.diffServerTime = serverTime.diff(localTime)
  },

  // 将时间转化成对应格式
  formatTime(time) {
    return dayjs(time).locale('zh-cn').calendar(dayjs().add(this.diffServerTime, 'ms'), {
      sameDay: 'HH:mm', // The same day ( Today at 2:30 AM )
      nextDay: '[明天]', // The next day ( Tomorrow at 2:30 AM )
      nextWeek: 'dddd', // The next week ( Sunday at 2:30 AM )
      lastDay: '[昨天] HH:mm', // The day before ( Yesterday at 2:30 AM )
      lastWeek: 'dddd HH:mm', // Last week ( Last Monday at 2:30 AM )
      sameElse: 'YYYY年M月D日 HH:mm' // Everything else ( 7/10/2011 )
    })
  },

  // 用于判断滑动到顶部
  startTouch(e) {
    let touch_down = e.touches[0].clientY;
    this.touch_down = touch_down;
    wx.createSelectorQuery().select('.scroll-container').boundingClientRect((rect) => {
        this.inner_height = rect.height;
    }).exec();
  },

  async endTouch(e) {
    let current_y = e.changedTouches[0].clientY;
    let { touch_down } = this;
    let start_scroll = ''
    // 获取 scroll-view 的高度和当前的 scrollTop 位置
    const res = await this.getScrollViewInfo()
    start_scroll = res.scrollTop;
    if (current_y > touch_down && current_y - touch_down > 20 && start_scroll <= 0) {
      // 下拉刷新 的请求和逻辑处理等
      if(getNewInfoFlag) {
        cachePage++
        getNewInfoFlag = false
        this.setData({
          showLoading: true
        })
        this.getChatInfo(true)
      }
    }  
  },

  // 申请照片
  handleApplyPhoto(e) {
    if(!applyPhotoFlag) return
    applyPhotoFlag = false
    const id = e.currentTarget.dataset.id
    const type = e.currentTarget.dataset.type
    const index = e.currentTarget.dataset.index
    request(26, {
      id,
      type,
    }).then(res => {
      console.log(res)
      applyPhotoFlag = true
      if(res.error === 0) {
       const historyList = [...this.data.historyList]
       historyList[index].photo_status = parseInt(type)
       this.setData({
        historyList
       })
      }
    }).catch(err => {
      console.log(err)
    })
  },

  // 获取滚动区域内容高度
  getScrollHeight() {
    return new Promise((res, rej) => {
      const query = wx.createSelectorQuery()
      query.select('.scroll-container').boundingClientRect((data) => {
        res(data)
      }).exec()
    })
  },

  getCopyScrollHeight() {
    return new Promise((res, rej) => {
      const query = wx.createSelectorQuery()
      query.select('.copyScrollContainer').boundingClientRect((data) => {
        res(data)
      }).exec()
    })
  },

  // 获取scroll-view信息
  getScrollViewInfo() {
    return new Promise((res, rej) => {
      const query = wx.createSelectorQuery()
      query.select('.chat-area').fields({  
        scrollOffset: true, 
        size: true 
      }, (rect) => { 
        res(rect)
      }).exec();
    })
  },

  // 预览图片
  previewImage(e) {
    const current = e.currentTarget.dataset.imgsrc
    wx.previewImage({
      urls: [current] // 需要预览的图片http链接列表
    })
  },
})