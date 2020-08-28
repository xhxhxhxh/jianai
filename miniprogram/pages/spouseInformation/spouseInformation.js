// miniprogram/pages/spouseInformation/spouseInformation.js
const request = require('../../request.js')
let stepIndex = 1
let informationBoxWidth = 0
let complete = false // 资料是否全部填写完成
let gender, age, ageArr, information

Page({

  /**
   * 页面的初始数据
   */
  data: {
    buttonDisabled: true,
    stepClass: { //控制步骤条
      step1: 'show',
      step2: '',
      step3: ''
    },
    stepComponent: {
      step1: true,
      step2: false,
      step3: false
    },
    informationBoxStyle: '', // 控制step切换动画
    buttonText: '下一步'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getInformationBoxWidth()
  },

  // 下一步
  next() {
    stepIndex++
    stepIndex = stepIndex > 3 ? 3 : stepIndex
    const stepClass = {
      step1: '',
      step2: '',
      step3: ''
    }
    stepClass['step' + stepIndex] = 'show'
    const key = `stepComponent.step${stepIndex}`
    const informationBoxStyle = `left: ${-(stepIndex - 1) * informationBoxWidth}px`
    const data = {
      stepClass,
      informationBoxStyle
    }
    data[key] = true
    if(stepIndex === 3 && !complete) {
      data['buttonDisabled'] = true
      data['buttonText'] = '已完成'
    }
    this.setData(data)
    if(complete) { // 提交信息
      this.submit()
    }
    // this.slide(`.information-box .step${stepIndex - 1}`, function() {
      
    // }.bind(this))

    // this.slide(`.information-box .step${stepIndex}`, function() {
    //   const key = `stepComponent.step${stepIndex - 1}`
    //   const data = {}
    //   data[key] = false
    //   this.setData(data)
    //   this.clearAnimation(`.information-select .step${stepIndex}`)
    // }.bind(this))
  },

  // 滑出动画
  slide(selector, callback) {
    this.animate(selector, [
      { left: 0 },
      { left: -informationBoxWidth }
      ], 1000, callback)
  },


  // 获取information-select宽度
  getInformationBoxWidth() {
    const query = wx.createSelectorQuery()
    query.select('.information-select').boundingClientRect(function(res){
      informationBoxWidth = res.width
    }).exec()
  },

  getGender(e) {
    gender = e.detail
    if(stepIndex === 1) {
      if(!gender.male && !gender.female) {
        this.setData({
          buttonDisabled: true
        })
      }else {
        this.setData({
          buttonDisabled: false
        })
      }
    }
  },

  getAge(e) {
    const data = e.detail
    age = data.age
    ageArr = data.ageArr
    if(stepIndex === 2) {
      if(ageArr[age[0]] > ageArr[age[2]]) {
        this.setData({
          buttonDisabled: true
        })
      }else {
        this.setData({
          buttonDisabled: false
        })
      }
    }
  },

  getInformation(e) {
    information = e.detail
    let num = 0
    for(let key in information) {
      if(information[key]) num++
    }
    if(num === 4) {
      this.setData({
        buttonDisabled: false
      })
      complete = true
    }
  },

  // 提交择偶信息
  submit() {
    let sex = -1
    if(gender.male) {
      sex = 1
    }
    if(gender.female) {
      sex = 2
    }
    if(gender.male && gender.female) {
      sex = 3
    }
    const data = {
      sex,
      age_min: ageArr[age[0]],
      age_max: ageArr[age[2]],
      height_min: information.height[0],
      height_max: information.height[1],
      education_min: information.education[0],
      education_max: information.education[1],
      income: information.income,
      region: information.locale
    }
    request(7, data).then(data => {
      if(data.error === 0) {
        const pages = getCurrentPages()
        wx.navigateBack().then(() => {
          pages[pages.length - 2].closeDialog()      
        }).catch(err => {
          wx.switchTab({
            url: '/pages/match/match',
          })
        })
      }
    }).catch(err => {
      console.log(err)
    })
  }
  
})