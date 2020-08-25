// components/spouseInformationComponent/moreInformation/moreInformation.js
const information = {}
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
    height: [2, 2],
    education: [2, 2],
    income: 2,
    locale: [],
    localeStr: '',
    heightArr: [[150, 160, 170, 180, 190, 200], [150, 160, 170, 180, 190, 200]],
    educationArr: [['大专及以下', '大专', '本科', '硕士', '博士'], ['大专及以下', '大专', '本科', '硕士', '博士']],
    incomeArr: ['2千以下', '2-5千', '5-10千', '1-2万', '2-5万', '5-10万', '10万以上'],
    defaultText: '请选择(必选)',
    heightSelected: false,
    educationSelected: false,
    incomeSelected: false,
    localeSelected: false
  },

  observers: {
    'height, education, income, locale': function() {
      this.triggerEvent('getInformation', {...information})
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
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

    educationChange(e) {
      const value = e.detail.value
      const educationArr = this.data.educationArr
      if(value[1] < value[0]) {
        const cache = value[0]
        value[0] = value[1]
        value[1] = cache
      }
      information.education = [educationArr[0][value[0]], educationArr[1][value[1]]]
      this.setData({
        education: value,
        educationSelected: true
      })
    },

    incomeChange(e) {
      const value = e.detail.value
      const incomeArr = this.data.incomeArr
      information.income = incomeArr[value]
      this.setData({
        income: value,
        incomeSelected: true
      })
    },

    localeChange(e) {
      const locale = e.detail.value
      let localeStr = ''
      locale.forEach(item => {
        localeStr += '/' + item
      })
      information.locale = localeStr.substr(1)
      this.setData({
        locale,
        localeStr: localeStr.substr(1),
        localeSelected: true
      })
    }
  }
})
