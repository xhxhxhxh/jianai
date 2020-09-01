const app = getApp()
let deletePhotoObj = {}
const request = require('../../request.js')
import uploadPhotos from '../profile/uploadPhoto'

Page({
	data: {
		isIphoneX: app.globalData.isIphoneX,
		size: 3,
		listData: [],
		showActionsheet: false,
		groups: [
			{ text: '编辑', value: 1 },
			{ text: '拍照', value: 2 },
			{ text: '从手机相册选择', value: 3 }
		],
		extraNodes: [
			{
				type: "after",
				dragId: "plus",
				slot: "plus",
				fixed: true
			}
		],
		pageMetaScrollTop: 0,
		scrollTop: 0,
		isEditing: false,
		selectedNum: 0
	},

	onLoad() {
		this.getPhoto()
	},

	onUnload() {
		// 离开页面后，更新我的中的照片
		const pages = getCurrentPages()
		const prevPage = pages[pages.length - 2]
		if(prevPage.route === "pages/profile/profile") {
			prevPage.getPhoto()
		}
	},

	// 获取照片
  getPhoto() {
    request(12).then(res => {
      if(res.error === 0) {
        const photos = res.photo
				photos.forEach(item => {
					item.selected = false
					item.dragId = item.id
				})
        this.setData({
          listData: photos
				})
				this.drag = this.selectComponent('#drag');
				this.drag.init();
      }
    }).catch(err => {
      console.log(err)
    })
	},
	
	// 预览照片
  onPreviewImage(event) {
    const current = event.detail.data.img
    const urls = this.data.listData.map(item => item.img)
    wx.previewImage({
      current, // 当前显示图片的http链接
      urls // 需要预览的图片http链接列表
    })
  },

	sortEnd(e) {
		console.log("sortEnd", e.detail.listData)
		this.setData({
			listData: e.detail.listData
		});
	},
	change(e) {
		console.log("change", e.detail.listData)
	},
	
	itemClick(e) {
		console.log(e);
		if(this.data.isEditing) {
			const id = e.detail.data.dragId
			const selected = e.detail.extra.selected
			deletePhotoObj[id] = selected

			// 获取选择个数
			let selectedNum = 0
			for(let key in deletePhotoObj) {
				if(deletePhotoObj[key]) selectedNum++
			}
			this.setData({
				selectedNum
			})
		}else {
			this.onPreviewImage(e)
		}
		
	},
	toggleFixed(e) {
		let key = e.currentTarget.dataset.key;

		let {listData} = this.data;

		listData[key].fixed = !listData[key].fixed

		this.setData({
			listData: listData
		});
	},

	// 显示弹出层
	showActionSheet(e) {
		if(!this.data.isEditing) {
			this.setData({
				showActionsheet: true
			})
		}
	},

	// 点击弹出栏
	handleActionSheetClick(e) {
		const value = e.detail.value
		if(value === 1) {
			this.editPhoto()
		}else if(value === 2) {
			this.chooseImage('camera')
		}else if(value === 3) {
			this.chooseImage('album')
		}
		this.setData({
			showActionsheet: false
		})
	},

	// 选择图片
	chooseImage(type) {
    wx.chooseImage({
      count: 9,
      sizeType: ['original', 'compressed'],
      sourceType: [type],
      success: (res) => {
        uploadPhotos(res.tempFilePaths, () => {
					this.getPhoto()
				})
      },
    })
	},
	
	// 编辑照片
	editPhoto() {
		let listData = this.data.listData
		listData.forEach(item => {
			item.isEditing = true
		})
		this.setData({
			listData,
			isEditing: true
		});
		this.drag.init();
	},

	// 删除照片
	deletePhotos() {
		if(this.data.selectedNum > 0) {
			const ids = []
			for(let key in deletePhotoObj) {
				if(deletePhotoObj[key]) {
					ids.push(key)
				}
			}
			
			request(13, {ids: ids.join(',')}).then(res => {
				if(res.error === 0) {
					let listData = this.data.listData
					listData = listData.filter(item => {
						const id = item.id
						item.isEditing = false
						return !deletePhotoObj[id]
					})
					deletePhotoObj = {}
					this.setData({
						listData,
						selectedNum: 0,
						isEditing: false
					})
					this.drag.init();
				}
			}).catch(err => {
				console.log(err)
			})
		}else {
			let listData = this.data.listData
			listData.forEach(item => {
				item.isEditing = false
			})
			this.setData({
				listData,
				isEditing: false
			})
			this.drag.init();
		}
		
	},

	scroll(e) {
		this.setData({
			pageMetaScrollTop: e.detail.scrollTop
		})
	},
	// 页面滚动
	onPageScroll(e) {
		this.setData({
			scrollTop: e.scrollTop
		});
	},
})
