import axios from 'axios'
import store from '@/store'
import storage from 'store'
import route from '@/router'
import notification from 'ant-design-vue/es/notification'
import { VueAxios } from './axios'
import { ACCESS_TOKEN } from '@/store/mutation-types'

// 创建 axios 实例
const request = axios.create({
  // API 请求的默认前缀
  baseURL: process.env.VUE_APP_API_BASE_URL,
  timeout: 6000 // 请求超时时间
})

/**
 * 跳转登录页
 * 携带当前页面路由，以期在登录页面完成登录后返回当前页面
 */
const toLogin = () => {
  store.dispatch('Logout').then(() => {
    route.push({ name: 'login' })
  })
  console.log('退出')
}

// 异常拦截处理器
const errorHandler = (error) => {
  if (error.response) {
    const data = error.response.data
    // 从 localstorage 获取 token
    const token = storage.get(ACCESS_TOKEN)
    if (error.response.status === 403) {
      notification.error({
        message: 'Forbidden',
        description: data.message
      })
    }
    if (error.response.status === 401 && !(data.result && data.result.isLogin)) {
      notification.error({
        message: 'Unauthorized',
        description: 'Authorization verification failed'
      })
      if (token) {
        store.dispatch('Logout').then(() => {
          setTimeout(() => {
            window.location.reload()
          }, 1500)
        })
      }
    }
  }
  return Promise.reject(error)
}

// 自定义错误拦截处理器
const customeErrorHandler = (response) => {
  // dataAxios 是 axios 返回数据中的 data
  const dataAxios = response.data
  // 这个状态码是和后端约定的
  const { statusCode } = dataAxios
  // 根据 code 进行判断
  if (statusCode === undefined) {
    // 如果没有 code 代表这不是项目后端开发的接口 比如可能是 D2Admin 请求最新版本
    return dataAxios
  } else {
    // 有 code 代表这是一个后端接口 可以进行进一步的判断
    switch (statusCode) {
      case 2000:
        // [ 示例 ] code === 0 代表没有错误
        return dataAxios
      case 3004:
        // [ 示例 ] 其它和后台约定的 code
        notification.warning(dataAxios.msg)
        toLogin()
        // errorCreate(`[ code: 3004 ] ${dataAxios.msg}: ${response.config.url}`)
        break
      case 3007:
        // [ 示例 ] 其它和后台约定的 code
        notification.warning(dataAxios.msg)
        toLogin()
        // errorCreate(`[ code: 3007 ] ${dataAxios.msg}: ${response.config.url}`)
        break
      case 3008:
        // [ 示例 ] 其它和后台约定的 code
        notification.warning(dataAxios.msg)
        toLogin()
        // errorCreate(`[ code: 3008 ] ${dataAxios.msg}: ${response.config.url}`)
        break
      case 3009:
        // [ 示例 ] 其它和后台约定的 code
        notification.warning(dataAxios.msg)
        toLogin()
        // errorCreate(`[ code: 3009 ] ${dataAxios.msg}: ${response.config.url}`)
        break
      case 3010:
        // [ 示例 ] 其它和后台约定的 code
        notification.warning(dataAxios.msg)
        toLogin()
        // errorCreate(`[ code: 3010 ] ${dataAxios.msg}: ${response.config.url}`)
        break
      default:
        // 不是正确的 code
        // errorCreate(`${dataAxios.msg}: ${response.config.url}`)
        // errorCreate(`${dataAxios.msg}`)
        return dataAxios
        // break
    }
  }
}

// request interceptor
request.interceptors.request.use(config => {
  const token = storage.get(ACCESS_TOKEN)
  // 如果 token 存在
  // 让每个请求携带自定义 token 请根据实际情况自行修改
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
}, errorHandler)

// response interceptor
request.interceptors.response.use((response) => {
  return customeErrorHandler(response)
}, errorHandler)

const installer = {
  vm: {},
  install (Vue) {
    Vue.use(VueAxios, request)
  }
}

export default request

export {
  installer as VueAxios,
  request as axios
}
