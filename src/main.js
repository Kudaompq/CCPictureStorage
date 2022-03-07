import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css'
import './assets/base.css'
import 'viewerjs/dist/viewer.css'
import Viewer from 'v-viewer'
import '@/utils/directive'

Vue.config.productionTip = false
Vue.use(ElementUI)
Vue.use(Viewer)

Vue.prototype.msgSuccess = function (msg) {
  this.$message.success(msg)
}
Vue.prototype.msgError = function (msg) {
  this.$message.error(msg)
}

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
