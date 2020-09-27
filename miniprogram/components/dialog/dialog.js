// components/dialog/dialog.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: String,
    content: String,
    imageSrc: String,
    contentTitle: String,
    showDialog: {
      type: Boolean,
      value: false
    },
    showImage: {
      type: Boolean,
      value: false
    },
    showClose: {
      type: Boolean,
      value: false
    },
    extClass: {
      type: String,
      value: 'my-dialog' // 另一值为top-dialog
    },
    buttons: Array,
    textColorPosition: Array // 用于将content中的部分文字变红, 仅支持连续数字的数组
  },

  /**
   * 组件的初始数据
   */
  data: {
    maskClosable: false,
    redContent: '',
    head: '',
    tail: '',
    scale: 1
  },

  options: {
    styleIsolation: 'shared'
  },

  lifetimes: {
    attached() {
      // 获取屏幕宽度，计算钩子的放大倍数
    wx.getSystemInfo({
      success: (result) => {
        const screenWidth = result.screenWidth
        this.setData({
          scale: screenWidth / 375
        })
      },
    })
    }
  },

  observers: {
    'content, textColorPosition': function(content, textColorPosition) {
      let head = content
      let redContent = ''
      let tail = ''
      if(textColorPosition && textColorPosition.length > 0) {
        const start = textColorPosition[0]
        const last = textColorPosition[textColorPosition.length - 1]
        head = content.substring(0, start)
        redContent = content.substring(start, last + 1)
        tail = content.substr(last + 1)
      }
      this.setData({
        head,
        redContent,
        tail
      })
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    closeDialog() {
      this.triggerEvent('closeDialog')
    },

    // button点击事件
    tapDialogButton(e) {
      const index = e.detail.index // 0左 1右
      if(index === 0) {
        this.triggerEvent('cancelDialog')
      }else if(index === 1) {
        this.triggerEvent('confirmDialog')
      }
    }
  }
})
