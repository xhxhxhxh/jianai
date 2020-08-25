// components/gender/gender.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    width: {
      type: String,
      value: '100%'
    },
    multiple: { // 是否支持多选
      type: Boolean,
      value: false
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
      const {maleSelected, femaleSelected} = this.data
      if(this.properties.multiple) { // 多选
        if(gender === 'male') {
          this.setData({
            maleSelected: !maleSelected
          })
        }
        if(gender === 'female') {
          this.setData({
            femaleSelected: !femaleSelected
          })
        }
      }else {
        if(gender === 'male') {
          if(!maleSelected) {
            this.setData({
              maleSelected: !maleSelected,
              femaleSelected: false
            })
          }else {
            this.setData({
              maleSelected: !maleSelected
            })
          }        
        }
        if(gender === 'female') {
          if(!femaleSelected) {
            this.setData({
              femaleSelected: !femaleSelected,
              maleSelected: false
            })
          }else {
            this.setData({
              femaleSelected: !femaleSelected
            })
          }
        }
      }
      

      this.triggerEvent('genderSelected', {male: this.data.maleSelected, female: this.data.femaleSelected})
    }
  }
})
