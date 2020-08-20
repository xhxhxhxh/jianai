// components/gender/gender.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    width: {
      type: String,
      value: '100%'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    maleSelected: false,
    femaleSelected: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 性别切换
    genderSelect(e) {
      const gender = e.currentTarget.dataset.gender
      if(gender === 'male') {
        this.setData({
          maleSelected: !this.data.maleSelected
        })
      }
      if(gender === 'female') {
        this.setData({
          femaleSelected: !this.data.femaleSelected
        })
      }

      this.triggerEvent('genderSelected', {male: this.data.maleSelected, female: this.data.femaleSelected})
    }
  }
})
