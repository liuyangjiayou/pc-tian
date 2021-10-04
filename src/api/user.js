import request from '@/utils/request'

// 登录
export function login(data) {
  return request({
    url: '/v1/user/login',
    method: 'post',
    data
  })
}

// 获取机构
export function getOrgs(data = {}) {
  return request({
    url: '/v1/user/getorgs',
    method: 'post',
    data,
    customOptions: {
      no_message: true
    }
  })
}

// 获取图形验证码
export function getSmsImage(data) {
  return request({
    url: '/v1/sys/yzmimg',
    method: 'post',
    data,
    customOptions: {
      no_message: true
    }
  })
}

// 获取短信验证码
export function getSms(data) {
  return request({
    url: '/v1/sys/sendsms',
    method: 'post',
    data
  })
}

// 开始注册
export function register(data) {
  return request({
    url: '/v1/user/reg',
    method: 'post',
    data
  })
}

// 获取下级机构列表
export function getLower() {
  return request({
    url: '/v1/user/getchild',
    method: 'post',
    customOptions: {
      no_message: true
    }
  })
}

// 通过下级机构审核
export function passLower(data) {
  return request({
    url: '/v1/user/chorgstatus',
    method: 'post',
    data
  })
}

// 获取活动列表
export function getBroadCastList() {
  return request({
    url: '/v1/user/getproject',
    method: 'post',
    customOptions: {
      no_message: true
    }
  })
}

// 获取队伍信息列表
export function getProduct(data) {
  return request({
    url: '/v1/rank/getrank',
    method: 'post',
    data,
    customOptions: {
      no_message: true
    }
  })
}
// 赛事报名 赛事修改
export function addProduct(data) {
  return request({
    url: '/v1/rank/addrank',
    method: 'post',
    data
  })
}
// 赛事修改获取详情
export function getProductEdit(data) {
  return request({
    url: '/v1/rank/view',
    method: 'post',
    data,
    customOptions: {
      no_message: true
    }
  })
}

// 赛事修改获取详情
export function addScore(data) {
  return request({
    url: '/v1/rank/addscore',
    method: 'post',
    data
  })
}

// 赛事修改获取详情
export function addUprank(data) {
  return request({
    url: '/v1/rank/uprankvideo',
    method: 'post',
    data
  })
}

// 修改密码
export function changePwd(data) {
  return request({
    url: '/v1/user/chpwd',
    method: 'post',
    data
  })
}

// 设置
export function setting(data) {
  return request({
    url: 'v1/sys/setting',
    method: 'post',
    data
  })
}

// 通过赛事报名
export function chstatusPass(data) {
  return request({
    url: 'v1/rank/chstatus',
    method: 'post',
    data
  })
}

