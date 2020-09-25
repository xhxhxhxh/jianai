// components/spouseInformationComponent/moreInformation/moreInformation.js
let information = {}
const request = require('../../../request.js')
const ageArr = []
const heightArr = [150, 160, 170, 180, 190, 200]
for(let i = 10; i <= 80; i++) {
  ageArr.push(i)
}

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    more: {
      value: false,
      type: Boolean
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    height: [2, 2],
    education: [2, 2],
    income: 2,
    locale: [],
    localeStr: '',
    sex: 0,
    age: [8, 8],
    ageArr: [ageArr, ageArr],
    heightArr: [heightArr, heightArr],
    educationArr: [],
    sexArr: ['男', '女', '男女皆可'],
    incomeArr: [],
    defaultText: '请选择(必选)',
    heightSelected: false,
    educationSelected: false,
    incomeSelected: false,
    localeSelected: false,
    sexSelected: false,
    ageSelected: false
  },

  observers: {
    'heightSelected, ageSelected, sexSelected, educationSelected, incomeSelected, localeSelected': function() {
      this.triggerEvent('getInformation', {...information})
    }
  },

  lifetimes: {
    attached: function() {
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
    // 获取择偶信息
    getSpouseInfo() {
      request(6).then(res => {
        console.log(res)
        if (res.error === 0) {
          wx.hideLoading()
          const {
            income,
            sex,
            region,
            education_min,
            education_max,
            age_min,
            age_max,
            height_min,
            height_max
          } = res
          const {
            incomeArr,
            educationArr
          } = this.data
          let [incomeIndex, educationMinIndex, educationMaxIndex, ageMinIndex, ageMaxIndex, heightMinIndex, heightMaxIndex] = [0, 0]

          // 获取income，education, age, height在下拉表中的序号
          if (income !== -1) {
            for (let i = 0; i < incomeArr.length; i++) {
              const current = incomeArr[i]
              if (current.k === income) {
                incomeIndex = i
                break
              }
            }
          }

          if (age_min !== -1) {
            for (let i = 0; i < ageArr.length; i++) {
              const current = ageArr[i]
              if (current === age_min) {
                ageMinIndex = i
              }
              if (current === age_max) {
                ageMaxIndex = i
                break
              }
            }
          }

          if (height_min !== -1) {
            for (let i = 0; i < heightArr.length; i++) {
              const current = heightArr[i]
              if (current === height_min) {
                heightMinIndex = i
              }
              if (current === height_max) {
                heightMaxIndex = i
                break
              }
            }
          }

          if (education_min !== -1) {
            for (let i = 0; i < educationArr[0].length; i++) {
              const current = educationArr[0][i]
              if (current.k === education_min) {
                educationMinIndex = i
              }
              if (current.k === education_max) {
                educationMaxIndex = i
                break
              }
            }
          }
          const info = {
            sex: sex === -1 ? 0 : sex - 1,
            age: age_min === -1 ? [8, 8] : [ageMinIndex, ageMaxIndex],
            height: height_min === -1 ? [2, 2] : [heightMinIndex, heightMaxIndex],
            income: income === -1 ? 2 : incomeIndex,
            education: education_min === -1 ? [2, 2] : [educationMinIndex, educationMaxIndex],
            localeStr: region,
            locale: region.split('/'),
            sexSelected: sex !== -1,
            educationSelected: education_min !== -1,
            incomeSelected: income !== -1,
            localeSelected: !!region,
            heightSelected: height_min !== -1,
            ageSelected: age_min !== -1
          }
          information = {
            height: height_min === -1 ? 0 : [heightArr[heightMinIndex], heightArr[heightMaxIndex]],
            locale: region,
            income: income === -1 ? 0 : incomeArr[incomeIndex].k,
            education: education_min === -1 ? 0 : [educationArr[0][educationMinIndex].k, educationArr[1][educationMaxIndex].k]
          }
          if(this.properties.more) {
            information.sex = sex === -1 ? 0 : sex
            information.age = age_min === -1 ? 0 : [ageArr[ageMinIndex], ageArr[ageMaxIndex]]
          }
          this.setData(info)
        }
      }).catch(err => {
        console.log(err)
      })
    },

    sexChange(e) {
      const value = e.detail.value
      information.sex = parseInt(value) + 1
      this.setData({
        sex: value,
        sexSelected: true
      })
    },

    heightChange(e) {
      const value = e.detail.value
      const heightArr = this.data.heightArr
      if(value[1] < value[0]) {
        const cache = value[0]
        value[0] = value[1]
        value[1] = cache
      }
      information.height = [heightArr[0][value[0]], heightArr[1][value[1]]]
      this.setData({
        height: value,
        heightSelected: true
      })
    },

    ageChange(e) {
      const value = e.detail.value
      const ageArr = this.data.ageArr
      if(value[1] < value[0]) {
        const cache = value[0]
        value[0] = value[1]
        value[1] = cache
      }
      information.age = [ageArr[0][value[0]], ageArr[1][value[1]]]
      this.setData({
        age: value,
        ageSelected: true
      })
    },

    educationChange(e) {
      const value = e.detail.value
      const educationArr = this.data.educationArr
      if(value[1] < value[0]) {
        const cache = value[0]
        value[0] = value[1]
        value[1] = cache
      }
      information.education = [educationArr[0][value[0]]['k'], educationArr[1][value[1]]['k']]
      this.setData({
        education: value,
        educationSelected: true
      })
    },

    incomeChange(e) {
      const value = e.detail.value
      const incomeArr = this.data.incomeArr
      information.income = incomeArr[value]['k']
      this.setData({
        income: value,
        incomeSelected: true
      })
    },

    localeChange(e) {
      const locale = e.detail.value
      const regionCode = e.detail.code
      let localeStr = ''
      locale.forEach(item => {
        localeStr += '/' + item
      })
      information.locale = localeStr.substr(1)
      if(regionCode[1]) {
        information.region_city_code = regionCode[1]
      }
      if(regionCode[2]) {
        information.region_ad_code = regionCode[2]
      }
      this.setData({
        locale,
        localeStr: localeStr.substr(1),
        localeSelected: true
      })
    },

    // 获取下拉数据
    getSelectData() {
      request(4, {
        types: 'education,income'
      }).then(data => {
        this.setData({
          educationArr: [data.education, data.education],
          incomeArr: data.income
        })
        this.getSpouseInfo()
      }).catch(err => {
        console.log(err)
      })
    }
  }
})
