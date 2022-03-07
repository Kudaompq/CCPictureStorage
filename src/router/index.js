import Vue from 'vue'
import VueRouter from 'vue-router'
import Index from "@/views/Index"
import Config from "@/views/Config";
import Picture from "@/views/Picture";
import Home from "@/views/Home";

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'index',
    redirect: '/home',
    component: Index,
    children: [
      {
        path: '/home',
        name: 'home',
        component: Home
      },
      {
        path: '/config',
        name: 'config',
        component: Config
      },
      {
        path: '/picture',
        name: 'picture',
        component: Picture
      }
    ]
  },
]

const router = new VueRouter({
  routes
})

// 解决重复访问相同路径报错的问题
//获取原型对象上的push函数
const originalPush = VueRouter.prototype.push
//修改原型对象中的push方法
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

export default router
