// components/spouseInformationComponent/ageSelect/ageSelect.js
const ageArr = []
for(let i = 10; i <= 80; i++) {
  ageArr.push(i)
}
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
    age: [8, 0, 8],
    ageArr
  },

  lifetimes: {
    attached: function() {
      this.triggerEvent('getAge', {age: this.data.age, ageArr})
    },
    
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 年龄选择
    ageChange(e) {
      const age = e.detail.value
      this.triggerEvent('getAge', {age, ageArr})
    }
  }
})
