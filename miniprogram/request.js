const md5 = require('blueimp-md5')
const dayjs = require('dayjs')
let app = null

const baseURL = 'https://www.97yuehui.com/AppGateway.ashx'

function getAuth(appArg) {
  const app = appArg || getApp()
  let auth = app.getGlobal('auth')
  let time = app.getGlobal('time')
  if(!auth) {
    const systemInfo = wx.getSystemInfoSync()
    const system = systemInfo.system.split(' ')
    auth = {
      imei: randomString(),
      os: system[0],
      os_version: system[1],
      app_version: '0.0.1',
      time_stamp: dayjs().format('YYYYMMDDHHmmss'),
      channel: 'develop',
      uid: -1,
      token: ''
    }
    wx.setStorage({
      key: "auth",
      data: auth
    })
    app.setGlobal('auth', auth)
  }else {
    const serverTimeUnix = dayjs(time.serverTime).unix() * 1000
    const localTimeUnix = dayjs(time.localTime).unix() * 1000
    const currentTimeUnix = dayjs().unix() * 1000
    auth.time_stamp = dayjs(serverTimeUnix + currentTimeUnix - localTimeUnix).format('YYYYMMDDHHmmss')
  }
  return auth
}

// 生成随机字符串
function randomString(len) {
  len = len || 32;
  const $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'; 
  const maxPos = $chars.length;
  let pwd = '';
  for (let i = 0; i < len; i++) {
  　　pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return pwd;
}

// 获取签名
function getSign(auth, opt, info) {
  let sign = auth.imei + auth.os + auth.os_version + auth.app_version + auth.time_stamp + auth.channel + auth.uid + auth.token + 'GnlqZeAMcWL50xTZMltBrepmrpVCRR4L' + opt
  if(info) {
    sign += JSON.stringify(info)
  }
  sign = md5(sign).toLocaleUpperCase()
  return sign
}

const request = function(opt, data, method, app) {
  const wxapp = app || getApp()
  const auth = getAuth(app)
  const origin = {
    auth: JSON.stringify(auth),
    sign: getSign(auth, opt, data),
    opt
  }

  if(data) {
    Object.assign(origin, {info: JSON.stringify(data)})
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: baseURL, //仅为示例，并非真实的接口地址
      method: method || 'GET',
      data: origin,
      success (res) {
        const data = res.data
        if(data.error === -10007) { // token过期
          wx.removeStorage({
            key: 'auth',
            success: (res) => {
              wxapp.setGlobal('auth', '')
              wx.redirectTo({
                url: '/pages/login/login',
              })
            }
          })
        }
        resolve(res.data)
      },
      fail (err) {
        reject(err)
      }
    })
  })
}

module.exports = request