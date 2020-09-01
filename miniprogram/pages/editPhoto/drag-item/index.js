Component({
	properties: {
		columns: {
			type: Number,
			value: 1
		},
		itemData: {
			type: Object,
			value: {}
		}
	},
	data: {
		selected: false
	},
	observers: {
		'itemData.selected': function(selected) {
			this.setData({
				selected
			})
		}
	},
	methods: {
		itemClick(e) {
			this.setData({
				selected: !this.data.selected
			})
			this.triggerEvent('click', {
				selected: this.data.selected
			});
		},

	},
	ready() {
	}
})
