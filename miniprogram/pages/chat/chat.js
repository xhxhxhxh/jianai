const request = require('../../request.js')
import uploadPhotos from '../profile/uploadPhoto'

const app = getApp()
const dayjs = require('dayjs')
require('dayjs/locale/zh-cn')
const calendar = require('dayjs/plugin/calendar')
dayjs.extend(calendar)

let tagid = ''
let applyPhotoFlag = true // 防止多次申请
let getNewInfoFlag = true 
let cachePage = 1
let scrollBottom = 0
let timeout = null
function compareVersion(v1, v2) {
  v1 = v1.split('.')
  v2 = v2.split('.')
  const len = Math.max(v1.length, v2.length)

  while (v1.length < len) {
    v1.push('0')
  }
  while (v2.length < len) {
    v2.push('0')
  }

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i], 10)
    const num2 = parseInt(v2[i], 10)

    if (num1 > num2) {
      return 1
    } else if (num1 < num2) {
      return -1
    }
  }

  return 0
}
Page({
  data: {
    lineHeight: 24,
    functionShow: false,
    emojiShow: false,
    comment: '',
    focus: false,
    cursor: 0,
    _keyboardShow: false,
    emojiSource: 'https://res.wx.qq.com/op_res/eROMsLpnNC10dC40vzF8qviz63ic7ATlbGg20lr5pYykOwHRbLZFUhgg23RtVorX',
    historyList:[],
    copyHistoryList: [], // 用于计算聊天区域高度
    showCopyScrollContainer: false,
    layoutHeight: '0px',
    safeHeight: 0,
    keyboardHeight: 0,
    isIOS: false,
    canIUse: true,
    scrollTop: 0,
    showLoading: false,
    scrollIntoView: '', // 控制滚动到的元素id
    timeObj: {}, // 记录聊天时间
    showDialog: false,
    dialogContent: '',
    buttons: [{text: '狠心离开'}, {text: '支付'}],
    textColorPosition: [],
    extClass: 'my-dialog'
  },

  onLoad(option) {
    // 设置导航栏
    wx.setNavigationBarTitle({
      title: option.userName
    })
    this.timeObj = {}
    this.cacheHistoryList = []
    applyPhotoFlag = true
    getNewInfoFlag = true
    cachePage = 1
    scrollBottom = 0

    tagid = option.tagid
    this.getChatInfo()
    this.getDiffTime()

    const system = wx.getSystemInfoSync();
    let isIOS = system.platform === 'ios';
    
    this.safeHeight = (system.screenHeight - system.safeArea.bottom);
    const replyHeight = 80 * app.getGlobal('scale')
    let layoutHeight = wx.getSystemInfoSync().windowHeight - replyHeight;
    if(isIOS) {
      layoutHeight -= this.safeHeight
    }
    this.layoutHeight = layoutHeight
    this.setData({
      isIOS,
      safeHeight: this.safeHeight,
      layoutHeight,
    })    
    const emojiInstance = this.selectComponent('.mp-emoji')
    this.emojiNames = emojiInstance.getEmojiNames()
    this.parseEmoji = emojiInstance.parseEmoji;
  },

  onUnload() {
    this.clearTimeout()
  },

  onReady() {
    // 解决基础库小于 2.9.2 的兼容问题
    const { SDKVersion } = wx.getSystemInfoSync();
    if(compareVersion(SDKVersion, '2.9.1') < 0) {
      this.setData({
        canIUse: false,
      })
    }
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
            item.emoji = this.parseEmoji(item.content.replace(/&lf;/g, '\n').replace(/&add;/g, '+'))
          }
          if(item.type === 2) {
            item.imageSrc = item.content
          }
          return item.type === 1 || item.type === 2 || (item.type === 3 && item.from === 2)
        })

        if(newInfo.length === 0) { // 处理当出现10条信息都是自己的照片申请时
          cachePage++
          getNewInfoFlag = false
          cacheHistoryList.reverse()
          this.cacheHistoryList = cacheHistoryList
          this.getChatInfo()
          return
        }

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
          this.cacheHistoryList = this.cacheHistoryList ? cacheHistoryList.concat(this.cacheHistoryList) : cacheHistoryList
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
            item.emoji = this.parseEmoji(item.content.replace(/&lf;/g, '\n').replace(/&add;/g, '+'))
          }
          if(item.type === 2) {
            item.imageSrc = item.content
          }
          return item.type === 1 || item.type === 2 || (item.type === 3 && item.from === 2)
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
    console.log('newInfo', data)
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

  onkeyboardHeightChange(e) {
    const {height} = e.detail
    if (height === 0) {
      this.data._keyboardShow = false
      console.log('关闭键盘')
      const {emojiShow, functionShow} = this.data
      if(!emojiShow && !functionShow) {
        this.setData({
          safeHeight: this.safeHeight,
          keyboardHeight: height,
          layoutHeight: this.layoutHeight,
          extClass: 'my-dialog'
        })
      }
    } else {
      this.data._keyboardShow = true
      const layoutHeight = this.data.isIOS ? this.layoutHeight - height + this.safeHeight : this.layoutHeight - height
      this.setData({
        safeHeight: 0,
        functionShow: false,
        emojiShow: false,
        keyboardHeight: height,
        extClass: 'my-dialog top-dialog',
        layoutHeight
      }, async () => {
        const res = await this.getScrollHeight()
        this.setData({
          scrollTop: res.height
        })    
      })
    }
    
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

  showEmoji() {
    const {emojiShow} = this.data
    console.log('显示emoji')
    const data = {
      functionShow: false,
      emojiShow: !this.data.emojiShow,
      safeHeight: this.safeHeight,
      keyboardHeight: 0,
    }
    if(emojiShow) {
      data.layoutHeight = this.layoutHeight
      data.extClass =  'my-dialog'
    }else {
      data.layoutHeight = this.layoutHeight - 300
      data.extClass =  'my-dialog top-dialog'
    }  
    this.setData(data, async () => {
      if(!emojiShow) {
        const res = await this.getScrollHeight()
        this.setData({
          scrollTop: res.height
        })
      }     
    })  
  },
  showFunction() {
    const {functionShow} = this.data
    const data = {
      emojiShow: false,
      functionShow: !this.data.functionShow,
      safeHeight: this.safeHeight,
      keyboardHeight: 0,
    }
    if(functionShow) {
      data.layoutHeight = this.layoutHeight
    }else {
      data.layoutHeight = this.layoutHeight - 200
    }
    this.setData(data, async () => {
      if(!functionShow) {
        const res = await this.getScrollHeight()
        this.setData({
          scrollTop: res.height
        })
      }     
    })  
  },

  // 选择图片
  chooseImage(e) {
    const type = e.currentTarget.dataset.type
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: [type],
      success: (res) => {
        uploadPhotos(res.tempFilePaths, (data) => {
          if(data.error === 0) {
            this.sendImage(res.tempFilePaths, data.last_msg_id)
          }else if(data.error === -2101) {
            this.showPayGoldDialog(data)
          }       
				}, {tagid, type: 'UploadChat '})
      },
    })
  },

  onFocus() {
    this.data._keyboardShow = true
    console.log('聚焦')
  },

  // 主动出发键盘弹起
  triggerFocus() {
    this.data._keyboardShow = true
    this.setData({
      focus: true
    })
  },

  // 关闭键盘及emoji区域
  closeKeyboard() {
    const {_keyboardShow, functionShow, emojiShow} = this.data
    if(!_keyboardShow && (functionShow || emojiShow)) {     
      this.setData({
        emojiShow: false,
        functionShow: false,
        layoutHeight: this.layoutHeight,
        extClass: 'my-dialog',
      })
    }
  },

  onBlur(e) {
    this.data._keyboardShow = false
    this.data.cursor = e.detail.cursor || 0
  },
  onInput(e) {
    const value = e.detail.value
    this.data.comment = value
  },
  onConfirm() {
    this.onsend()
  },
  insertEmoji(evt) {
    const emotionName = evt.detail.emotionName
    const {cursor, comment} = this.data
    const newComment =
      comment.slice(0, cursor) + emotionName + comment.slice(cursor)
    this.setData({
      comment: newComment,
      cursor: cursor + emotionName.length
    })
  },
  onsend() {
    const comment = this.data.comment.trim()
    if(!comment) return
    request(21, {
      tag_uid: tagid,
      content: comment.replace(/\n/g, '&lf;').replace(/\+/g, '&add;'),
    }).then(res => {
      console.log(res)    
      if(res.error === 0) {
        const last_msg_id = res.last_msg_id
        const parsedComment = {
          emoji: this.parseEmoji(comment.replace(/&lf;/g, '\n').replace(/&add;/g, '+')),
          id: `emoji_${last_msg_id}`,
          type: 1,
          from: 1,
          numid: last_msg_id,
          datetime: dayjs().add(this.diffServerTime, 'ms').format('YYYY-MM-DD HH:mm:ss')
        }
        this.cacheHistoryList.push(parsedComment)
        this.calculateTime([parsedComment], true)
        const data = {
          historyList: [...this.data.historyList, parsedComment],
          comment: '',
          scrollIntoView: parsedComment.id,
          timeObj: {...this.timeObj}
        }
        this.setData(data)
      }else if(res.error === -2101) { // 延长聊天
        this.showPayGoldDialog(res)
      }
    }).catch(err => {
      console.log(err)
    })
  },

  // 发送图片
  sendImage(data, id) {
    const parsedComment = []
    const historyList = this.data.historyList
    data.forEach(item => {
      parsedComment.push({
        id: 'emoji_' + id,
        imageSrc: item,
        type: 2,
        from: 1,
        numid: id,
        datetime: dayjs().add(this.diffServerTime, 'ms').format('YYYY-MM-DD HH:mm:ss')
      })
    });
    this.cacheHistoryList.push(parsedComment[0])
    this.calculateTime(parsedComment, true)
    this.setData({
      historyList: historyList.concat(parsedComment),
      scrollIntoView: parsedComment[0].id,
      timeObj: {...this.timeObj}
    })
  },

  // 显示延长聊天弹窗
  showPayGoldDialog(res) {
    const gold = res.gold
    this.trade_id = res.trade_id
    this.setData({
      showDialog: true,
      dialogContent: `聊天时效只有24小时，如仍需聊天需支付${gold}金币延长时间`,
      textColorPosition: [19, 19 + gold.toString().length - 1]
    })
  },

  // 预览图片
  previewImage(e) {
    const current = e.currentTarget.dataset.imgsrc
    wx.previewImage({
      urls: [current] // 需要预览的图片http链接列表
    })
  },

  deleteEmoji() {
    const pos = this.data.cursor
    const comment = this.data.comment
    let result = ''
    let cursor = 0

    let emojiLen = 6
    let startPos = pos - emojiLen
    if (startPos < 0) {
      startPos = 0
      emojiLen = pos
    }
    const str = comment.slice(startPos, pos)
    const matchs = str.match(/\[([\u4e00-\u9fa5\w]+)\]$/g)
    // 删除表情
    if (matchs) {
      const rawName = matchs[0]
      const left = emojiLen - rawName.length
      if (this.emojiNames.indexOf(rawName) >= 0) {
        const replace = str.replace(rawName, '')
        result = comment.slice(0, startPos) + replace + comment.slice(pos)
        cursor = startPos + left
      }
      // 删除字符
    } else {
      let endPos = pos - 1
      if (endPos < 0) endPos = 0
      const prefix = comment.slice(0, endPos)
      const suffix = comment.slice(pos)
      result = prefix + suffix
      cursor = endPos
    }
    this.setData({
      comment: result,
      cursor
    })
  },

  // 确认弹窗
  confirmDialog() {
    request(34, {
      id: this.trade_id,
    }).then(res => {
      if(res.error === 0) {
        wx.showToast({
          title: '支付成功',
          icon: 'success'
        })
        this.setData({
          showDialog: false
        })
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

  // 取消弹窗
  cancelDialog() {
    this.setData({
      showDialog: false
    })
  }
})
