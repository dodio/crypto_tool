import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import(/* webpackChunkName: "home" */ './views/Home.vue')
    },
    {
      path: '/difference',
      name: 'difference',
      component: () => import(/* webpackChunkName: "difference" */ './views/Difference.vue')
    }
  ]
});
