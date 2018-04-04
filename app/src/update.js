import Vue from 'vue';
import Router from 'vue-router';

import updateDetial from './components/updateDetial/updateDetial';
import routes from './routes';
import Locale from './locale';
import element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import electron from 'electron'
Locale.use('zh-CN');

Vue.use(Router);
Vue.use(element);
Vue.config.debug = true;
Vue.prototype.$ect = electron;

const router = new Router({
  scrollBehavior: () => ({ y: 0 }),
  routes
});

new Vue({
  router,
  ...updateDetial
}).$mount('#app');
