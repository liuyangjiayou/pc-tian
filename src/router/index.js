import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)

/* Layout */
import Layout from '@/layout'
import { getUser } from '@/utils/auth'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/register',
    component: () => import('@/views/login/register'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/custom/product'),
      meta: { title: '参赛作品列表', icon: 'dashboard' }
    }, {
      path: 'add',
      name: 'ProductAdd',
      component: () => import('@/views/custom/addProduct'),
      hidden: true,
      meta: { title: '添加队伍名称', icon: 'el-icon-s-help' }
    }, {
      path: 'details',
      name: 'Details',
      component: () => import('@/views/custom/rankDetails'),
      hidden: true,
      meta: { title: '队伍详情', icon: 'el-icon-s-help' }
    }]
  }
]
export const asyncRouter = [
  {
    path: '/labor',
    component: Layout,
    name: 'Labor',
    children: [
      {
        path: 'index',
        name: 'list',
        component: () => import('@/views/custom/laborAdmin'),
        meta: { title: '工会管理', icon: 'el-icon-s-help' }
      }
    ]
  }]
// 404 page must be placed at the end !!!
export const router_404 = { path: '*', redirect: '/404', hidden: true }
const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes.concat(asyncRouter).concat(router_404)
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
