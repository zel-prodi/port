import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify';
import myPlugin from './plugins/myPlugins';
import Vue2Editor from "vue2-editor";
import axios from 'axios';
import VueIziToast from "vue-izitoast";
import "izitoast/dist/css/iziToast.css";
import i18n from './i18n';


Vue.config.productionTip = false
Vue.prototype.axios = axios;

Vue.use(myPlugin)
Vue.use(Vue2Editor);
Vue.use(VueIziToast);


router.beforeEach((to, from, next)=>{
  let language = to.params.lang;
  if(!language){
    language = 'ja'
  }

  i18n.locale = language;
  next();
})

new Vue({
  router,
  store,
  vuetify,
  i18n,
  render: h => h(App)
}).$mount('#app')

// var quill = new Quill('#editor', {
//   theme: 'snow',
//    modules: {
//       imageResize: {
//         displaySize: true
//       }
//   }
// });