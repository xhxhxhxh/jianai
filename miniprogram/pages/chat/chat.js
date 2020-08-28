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
    // parsedComment: []
    historyList:[],
    layoutHeight: '0px',
    safeHeight: 0,
    keyboardHeight: 0,
    isIOS: false,
    canIUse: true,
    scrollTop: 0,
  },

  onLoad(option) {
    // 设置导航栏
    wx.setNavigationBarTitle({
      title: option.userName
    })

    const system = wx.getSystemInfoSync();
    let isIOS = system.platform === 'ios';
    
    this.safeHeight = (system.screenHeight - system.safeArea.bottom);
    const replyHeight = 80
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
  onReady() {
    // 解决基础库小于 2.9.2 的兼容问题
    const { SDKVersion } = wx.getSystemInfoSync();
    if(compareVersion(SDKVersion, '2.9.1') < 0) {
      this.setData({
        canIUse: false,
      })
    }
  },
  async onkeyboardHeightChange(e) {
    const {height} = e.detail
    if (height === 0) {
      this.data._keyboardShow = false
      console.log('关闭键盘')
      const {emojiShow, functionShow} = this.data
      if(!emojiShow && !functionShow) {
        this.setData({
          safeHeight: this.safeHeight,
          keyboardHeight: height,
          layoutHeight: this.layoutHeight
        })
      }
    } else {
      this.data._keyboardShow = true
      const layoutHeight = this.data.isIOS ? this.layoutHeight - height + this.safeHeight : this.layoutHeight - height
      const res = await this.getScrollHeight()
      this.setData({
        safeHeight: 0,
        functionShow: false,
        emojiShow: false,
        keyboardHeight: height,
        scrollTop: res.height,
        layoutHeight
      })
    }
  },

  // 获取滚动区h域内容高度
  getScrollHeight() {
    return new Promise((res, rej) => {
      const query = wx.createSelectorQuery()
      query.select('.scroll-container').boundingClientRect((data) => {
        res(data)
      }).exec()
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
    }else {
      data.layoutHeight = this.layoutHeight - 300
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
    console.log('显示Function')
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
      count: 9,
      sizeType: ['original', 'compressed'],
      sourceType: [type],
      success: (res) => {
        this.sendImage(res.tempFilePaths)
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
    console.log('开始滑动')
    const {_keyboardShow, functionShow, emojiShow} = this.data
    if(!_keyboardShow && (functionShow || emojiShow)) {     
      console.log('点击scroll区域')
      this.setData({
        emojiShow: false,
        functionShow: false,
        layoutHeight: this.layoutHeight
      })
    }
  },

  onBlur(e) {
    this.data._keyboardShow = false
    this.data.cursor = e.detail.cursor || 0
    console.log('失去焦点')
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
    const random = parseInt(Math.random() * 2)
    const comment = this.data.comment
    const parsedComment = {
      emoji: this.parseEmoji(comment),
      id: `emoji_${this.data.historyList.length}`,
      self: random
    }
    const data = {
      historyList: [...this.data.historyList, parsedComment],
      comment: '',
    }
    this.setData(data)
  },

  // 发送图片
  sendImage(data) {
    const random = parseInt(Math.random() * 2)
    const parsedComment = []
    const historyList = this.data.historyList
    let id = historyList.length
    data.forEach(item => {
      parsedComment.push({
        id: 'emoji_' + id++,
        self: random,
        imageSrc: item,
        type: 'image'
      })
    });
    this.setData({
      historyList: historyList.concat(parsedComment)
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
  }
})
