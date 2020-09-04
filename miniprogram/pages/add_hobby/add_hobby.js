// miniprogram/pages/add_hobby/add_hobby.js
let type = ''
let inputValue = ''
let localHobby = {}
let flag = true // 控制添加标签的阀
const request = require('../../request.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hobby: [],
    value: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    type = options.type
    let name = ''
    switch(type) {
      case 'sport': name = '运动爱好'; break;
      case 'food': name = '美食爱好'; break;
      case 'travel': name = '旅行爱好'; break;
    }
    wx.setNavigationBarTitle({
      title: name
    })
    wx.getStorage({
      key: 'hobby',
      success: (res) => {
        // 给hobby元素添加id
        localHobby = res.data
        const hobby = localHobby[type].map((item, index) => {
          return {
            id: index,
            name: item
          }
        })
        
        this.setData({
          hobby
        })
      }
    })
  },

  onUnload() {
		// 离开页面后，更新标签
		const pages = getCurrentPages()
		const prevPage = pages[pages.length - 2]
		if(prevPage && prevPage.route === "pages/detailInfo_edit/detailInfo_edit") {
			prevPage.getHobbyFromLocal()
		}
	},

  inputChange(e) {
    inputValue = e.detail.value.trim()
  },

  addTags() {
    const hobby = [...this.data.hobby]
    if(hobby.length >= 10) {
      wx.showToast({
        title: '最多只能添加10个',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if(inputValue && flag) {
      const data = {}
      flag = false
      // 转化成字符串
      const value = hobby.reduce((total, currentValue) => {
        return total += (currentValue.name + ',')
      }, '')

      data[type] = value + inputValue
      request(9, data).then(res => {
        if(res.error === 0) { 
          hobby.push({
            id: hobby.length > 0 ? hobby[hobby.length - 1].id + 1 : 0,
            name: inputValue
          })       
          this.setData({
            hobby,
            value: ''
          })
          localHobby[type].push(inputValue)
          wx.setStorage({
            data: localHobby,
            key: 'hobby',
          })
          flag = true
        }
      }).catch(err => {
        console.log(err)
      })
    }
  },

  // 删除标签
  deleteTag(e) {
    const id = e.currentTarget.dataset.id
    if(id !== undefined) {
      const hobby = this.data.hobby.filter(item => {
        return item.id !== id
      })
      const data = {}
      // 转化成字符串
      const value = hobby.reduce((total, currentValue) => {
        return total += (currentValue.name + ',')
      }, '')
      data[type] = value.substr(0, value.length - 1)
      request(9, data).then(res => {
        if(res.error === 0) {      
          this.setData({
            hobby,
          })
          localHobby[type] = hobby.map(item => item.name)
          wx.setStorage({
            data: localHobby,
            key: 'hobby',
          })
        }
      }).catch(err => {
        console.log(err)
      })
    }
  }

  
})