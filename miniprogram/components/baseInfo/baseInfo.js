const request = require('../../request.js')
let userInfo = {}
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    sex: 0,
    education: 0,
    income: 0,
    nickname: '',
    huji: '',
    weight: '',
    height: '',
    sexArr: ['男', '女'],
    region: [],
    regionStr: '',
    huji: [],
    hujiStr: '',
    educationArr: [],
    incomeArr: [],
    defaultText: '请选择(必选)',
    sexSelected: false,
    educationSelected: false,
    incomeSelected: false,
    regionSelected: false,
    hujiSelected: false,
  },

  observers: {
    'nickname, weight, height, sexSelected, regionSelected, hujiSelected, educationSelected, incomeSelected': function () {
      this.triggerEvent('sendUserInfo', {...userInfo})
    }
  },

  lifetimes: {
    attached: function () {
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      this.getSelectData()
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 获取下拉数据
    getSelectData() {
      request(4, {
        types: 'education,income'
      }).then(data => {
        console.log(data)
        this.setData({
          educationArr: data.education,
          incomeArr: data.income
        })
        this.getUserInfo() // 确保已经得到下拉数据
      }).catch(err => {
        console.log(err)
      })
    },

    // 获取基本信息
    getUserInfo() {
      request(5).then(res => {
        console.log(res)
        if (res.error === 0) {
          wx.hideLoading()
          const {
            income,
            education
          } = res
          const {
            incomeArr,
            educationArr
          } = this.data
          let [incomeIndex, educationIndex] = [0, 0]

          // 获取income，education在下拉表中的序号
          if (income !== -1) {
            for (let i = 0; i < incomeArr.length; i++) {
              const current = incomeArr[i]
              if (current.k === income) {
                incomeIndex = i
                break
              }
            }
          }

          if (education !== -1) {
            for (let i = 0; i < educationArr.length; i++) {
              const current = educationArr[i]
              if (current.k === education) {
                educationIndex = i
                break
              }
            }
          }

          const info = {
            nickname: res.nickname,
            sex: res.sex === -1 ? 0 : res.sex - 1,
            height: res.height === -1 ? '' : res.height,
            weight: res.weight === -1 ? '' : res.weight,
            income: income === -1 ? 0 : incomeIndex,
            education: education === -1 ? 0 : educationIndex,
            hujiStr: res.huji,
            regionStr: res.region,
            region: res.region.split('/'),
            huji: res.huji.split('/'),
            sexSelected: res.sex !== -1,
            educationSelected: education !== -1,
            incomeSelected: income !== -1,
            regionSelected: !!res.region,
            hujiSelected: !!res.huji,
            birthday: res.birthday
          }

          const {nickname, height, weight, regionStr, hujiStr} = info
          userInfo = {
            nickname,
            height,
            weight,
            sex: res.sex === -1 ? 0 : res.sex,
            region: regionStr,
            huji: hujiStr,
            income: income === -1 ? 0 : incomeArr[incomeIndex].k,
            education: education === -1 ? 0 : educationArr[educationIndex].k
          }
          this.setData(info)
        }
      }).catch(err => {
        console.log(err)
      })
    },

    sexChange(e) {
      if(this.data.birthday) {
        wx.showToast({
          title: '实名认证后无法修改性别',
          icon: 'none'
        })
        return
      }
      const value = e.detail.value
      userInfo.sex = parseInt(value) + 1
      this.setData({
        sex: value,
        sexSelected: true
      })
    },

    nicknameChange(e) {
      const value = e.detail.value
      userInfo.nickname = value
      this.setData({
        nickname: value
      })
    },

    weightChange(e) {
      const value = e.detail.value
      const reg = /^\d{1,3}$/
      if(reg.test(value) && value > 0 && value < 1000) {
        userInfo.weight = parseInt(value)
      }else {
        userInfo.weight = parseInt(0)
        wx.showToast({
          title: '体重不正确',
          icon: 'none',
          duration: 2000
        })
      }
      this.setData({
        weight: value
      })
    },

    heightChange(e) {
      const value = e.detail.value
      userInfo.height = parseInt(value)
      const reg = /^\d{1,3}$/
      if(reg.test(value) && value > 0 && value < 300) {
        userInfo.height = parseInt(value)     
      }else {
        userInfo.height = parseInt(0)
        wx.showToast({
          title: '身高不正确',
          icon: 'none',
          duration: 2000
        })
      }
      this.setData({
        height: value
      })
    },

    regionChange(e) {
      console.log(e)
      const region = e.detail.value
      const regionCode = e.detail.code
      let regionStr = ''
      region.forEach(item => {
        regionStr += '/' + item
      })
      userInfo.region = regionStr.substr(1)

      if(regionCode[1]) {
        userInfo.region_city_code = regionCode[1]
      }
      if(regionCode[2]) {
        userInfo.region_ad_code = regionCode[2]
      }
      
      this.setData({
        regionStr: regionStr.substr(1),
        regionSelected: true
      })
    },

    hujiChange(e) {
      const huji = e.detail.value
      let hujiStr = ''
      huji.forEach(item => {
        hujiStr += '/' + item
      })
      userInfo.huji = hujiStr.substr(1)
      this.setData({
        hujiStr: hujiStr.substr(1),
        hujiSelected: true
      })
    },

    educationChange(e) {
      const value = e.detail.value
      userInfo.education = this.data.educationArr[value].k
      this.setData({
        education: value,
        educationSelected: true
      })
    },

    incomeChange(e) {
      const value = e.detail.value
      userInfo.income = this.data.incomeArr[value].k
      this.setData({
        income: value,
        incomeSelected: true
      })
    },

  }
})