const request = require('../../request.js')
let detailInfo = {}

Page({

  /**
   * 页面的初始数据
   * data参数命名格式需一致
   */
  data: {
    introduction: '',
    introductionLength: 0,
    defaultText: '请选择',
    school: '',
    job: '',
    house: 0,
    car: 0,
    nation: 0,
    belief: 0,
    company: 0,
    smoke: 0,
    drink: 0,
    have_children: 0,
    wanna_children: 0,
    wedding: 0,
    houseArr: [],
    carArr: [],
    nationArr: [],
    beliefArr: [],
    companyArr: [],
    smokeArr: [],
    drinkArr: [],
    have_childrenArr: [],
    wanna_childrenArr: [],
    weddingArr: [],
    sport: [],
    food: [],
    travel: [],
    houseSelected: false,
    carSelected: false,
    nationSelected: false,
    beliefSelected: false,
    companySelected: false,
    smokeSelected: false,
    drinkSelected: false,
    have_childrenSelected: false,
    wanna_childrenSelected: false,
    weddingSelected: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    this.getSelectData()
  },

  getSelectData() {
    request(4, {
      types: 'house,car,nation,belief,company,smoke,drink,have_children,wanna_children,wedding'
    }).then(data => {
      console.log(data)
      this.setData({
        houseArr: data.house,
        carArr: data.car,
        nationArr: data.nation,
        beliefArr: data.belief,
        companyArr: data.company,
        smokeArr: data.smoke,
        drinkArr: data.drink,
        have_childrenArr: data.have_children,
        wanna_childrenArr: data.wanna_children,
        weddingArr: data.wedding,
      })
      this.getUserInfo() // 确保已经得到下拉数据
    }).catch(err => {
      console.log(err)
    })
  },

  // 获取基本信息
  getUserInfo() {
    request(8).then(res => {
      console.log(res)
      if (res.error === 0) {
        wx.hideLoading()
        const oldInfo = {
          house: res.house,
          car: res.car,
          nation: res.nation,
          belief: res.belief,
          company: res.company,
          smoke: res.smoke,
          drink: res.drink,
          have_children: res.have_children,
          wanna_children: res.wanna_children,
          wedding: res.wedding,
        }
        
        const oldInfoIndex = {
          houseIndex: 0,
          carIndex: 0,
          nationIndex: 0,
          beliefIndex: 0,
          companyIndex: 0,
          smokeIndex: 0,
          drinkIndex: 0,
          have_childrenIndex: 0,
          wanna_childrenIndex: 0,
          weddingIndex: 0
        }

        // 获取各参数在下拉表中的序号
        Object.keys(oldInfo).forEach(key => {
          const current = oldInfo[key]
          if(current !== -1) {
            const currentArr = this.data[key + 'Arr']
            for (let i = 0; i < currentArr.length; i++) {
              const item = currentArr[i]
              if (item.k === current) {
                oldInfoIndex[key + 'Index'] = i
                break
              }
            }
          }
        })
        const info = {
          house: oldInfoIndex.houseIndex,
          car: oldInfoIndex.carIndex,
          nation: oldInfoIndex.nationIndex,
          belief: oldInfoIndex.beliefIndex,
          company: oldInfoIndex.companyIndex,
          smoke: oldInfoIndex.smokeIndex,
          drink: oldInfoIndex.drinkIndex,
          have_children: oldInfoIndex.have_childrenIndex,
          wanna_children: oldInfoIndex.wanna_childrenIndex,
          wedding: oldInfoIndex.weddingIndex,
          school: res.school,
          job: res.job,
          sport: res.sport ? res.sport.split(',') : [],
          food: res.food ? res.food.split(',') : [],
          travel: res.travel ? res.travel.split(',') : [],
          introduction: res.introduction,
          houseSelected: oldInfo.house !== -1,
          carSelected: oldInfo.car !== -1,
          nationSelected: oldInfo.nation !== -1,
          beliefSelected: oldInfo.belief !== -1,
          companySelected: oldInfo.company !== -1,
          smokeSelected: oldInfo.smoke !== -1,
          drinkSelected: oldInfo.drink !== -1,
          have_childrenSelected: oldInfo.have_children !== -1,
          wanna_childrenSelected: oldInfo.wanna_children !== -1,
          weddingSelected: oldInfo.wedding !== -1,
        }

        const {
          houseArr,
          carArr,
          nationArr,
          beliefArr,
          companyArr,
          smokeArr,
          drinkArr,
          have_childrenArr,
          wanna_childrenArr,
          weddingArr
        } = this.data

        detailInfo = {
          house: oldInfo.house === -1 ? 0 : houseArr[info.house].k,
          car: oldInfo.car === -1 ? 0 : carArr[info.car].k,
          nation: oldInfo.nation === -1 ? 0 : nationArr[info.nation].k,
          belief: oldInfo.belief === -1 ? 0 : beliefArr[info.belief].k,
          company: oldInfo.company === -1 ? 0 : companyArr[info.company].k,
          smoke: oldInfo.smoke === -1 ? 0 : smokeArr[info.smoke].k,
          drink: oldInfo.drink === -1 ? 0 : drinkArr[info.drink].k,
          have_children: oldInfo.have_children === -1 ? 0 : have_childrenArr[info.have_children].k,
          wanna_children: oldInfo.wanna_children === -1 ? 0 : wanna_childrenArr[info.wanna_children].k,
          wedding: oldInfo.wedding === -1 ? 0 : weddingArr[info.wedding].k,
          introduction: res.introduction
        }

        // 将爱好存储在本地
        wx.setStorage({
          data: {
            sport: info.sport,
            food: info.food,
            travel: info.travel,
          },
          key: 'hobby',
        })

        this.setData(info)
      }
    }).catch(err => {
      console.log(err)
    })
  },

  // 信息改变触发
  detailChange(e) {
    const type = e.currentTarget.dataset.type
    const value = parseInt(e.detail.value)
    const data = {}
    data[type] = value
    data[type + 'Selected'] = true
    detailInfo[type] = this.data[type + 'Arr'][value].k
    this.setData(data)
  },

  handleInputChange(e) {
    const type = e.currentTarget.dataset.type
    const value = e.detail.value
    detailInfo[type] = value
  },

  // 计算自我介绍字数
  introductionChange(e) {
    const value = e.detail.value
    detailInfo['introduction'] = value
    this.setData({
      introductionLength: value.length
    })
  },

  // 跳转添加爱好页
  addHobby(e) {
    const type = e.currentTarget.dataset.type
    wx.navigateTo({
      url: '/pages/add_hobby/add_hobby?type=' + type,
    })
  },

  // 当从爱好编辑页返回时，从本地读取hopbby
  getHobbyFromLocal() {
    wx.getStorage({
      key: 'hobby',
      success: (res) => {
        // 给hobby元素添加id
        const localHobby = res.data      
        this.setData({
          ...localHobby
        })
      }
    })
  },

  saveInfo() {
    const info = {}
    for(let key in detailInfo) {
      if(detailInfo[key]) {
        info[key] = detailInfo[key]
      }
    }
    request(9, info).then(res => {
      if(res.error === 0) {      
        wx.showToast({
          title: '修改成功',
          icon: 'success'
        })
      }else {
        wx.showToast({
          title: res.msg,
          icon: 'none',
        })
      }
    }).catch(err => {
      console.log(err)
    })
  }
})
