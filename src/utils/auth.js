import Cookies from 'js-cookie'

const TokenKey = 'vue_admin_template_token'
const UserKey = 'vue_admin_template_user'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

/* user 信息相关 */

export function getUser() {
  const user = Cookies.get(UserKey)
  return user ? JSON.parse(user) : {}
}

export function setUser(User) {
  return Cookies.set(UserKey, User)
}

export function removeUser() {
  return Cookies.remove(UserKey)
}
