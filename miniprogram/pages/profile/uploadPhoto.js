// 抽离出上传图片的函数，便于其他页面调用,使用前请先将canvas组件放到页面中
// 上传图片
const app = getApp()
import {uploadImageURL} from '../../config'
export default async function uploadPhotos(tempFilePaths, callback) {
  const auth = app.getGlobal('auth')
  const tempFilePath = await transformImage(tempFilePaths[0])
  wx.uploadFile({
    url: uploadImageURL,
    filePath: tempFilePath,
    header: {
      'content-type': 'image/jpeg'
    },
    formData: {
      uid: auth.uid,
      token: auth.token,
      op: 'UploadPhoto'
    },
    name: 'file',
    success: (res) => {
      const data = JSON.parse(res.data)
      if(data.error === 0) {
        callback(data)
      }
    },
    fail (err) {
      console.log(err)
    }
  })
}
// 转化图片格式
function transformImage(tempFilePath) {
  return new Promise((resolve, reject) => {
    wx.getImageInfo({
      src: tempFilePath,
      success: res => {
        if(res.type !== 'jpeg') {
          wx.createSelectorQuery().select('#myCanvas')
          .fields({ node: true, size: true })
          .exec((selector) => {
            const canvas = selector[0].node
            const context = canvas.getContext('2d')
            const width = res.width // 图片宽度即为画板宽度
            const height = res.height
            const path = res.path
            canvas.width = width
            canvas.height = height
            resetCanvas(context, width, height)
            const image = canvas.createImage()
            image.onload = () => {
              context.drawImage(image, 0, 0)
              wx.canvasToTempFilePath({
                destWidth: width,
                destHeight: height,
                canvasId: 'myCanvas',
                fileType: 'jpg',
                canvas,
                success(res) {
                  resolve(res.tempFilePath)
                },
                fail(err) {
                  reject(err)
                }
              })
            }
            image.src = path
          })            
        }else {
          resolve(tempFilePath)
        }
      }
    })
  })  
}
//重绘画板
function resetCanvas(context, width, height){
  console.log(context)
  context.fillStyle = '#fff';//背景填充
  context.fillRect(0, 0, width, height) //设置填充
}