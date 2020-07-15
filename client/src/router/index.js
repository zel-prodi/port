import Vue from 'vue'
import Router from 'vue-router'
// import Home from '../views/Home.vue' 
import i18n from '../i18n'
import store from '../store/index'

Vue.use(Router)

let router =  new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    // {
    //   path:'/',
    //   redirect: `/${i18n.locale}`
    // },
    {
      path: '',
      redirect: `/${i18n.locale}/SignIn`,
      name: 'Sign In',
      component: () => import(/* webpackChunkName: "about" */ '../views/SignIn.vue')
  
    },
    {
      path:'/:lang',
      component:
      {
        render(c){return c('router-view')}
      },
      children:[
        {
          path: 'SignIn',
          name: 'Sign In',
          component: () => import(/* webpackChunkName: "about" */ '../views/SignIn.vue')
      
        },
        {
          path: 'TsuutatsuPage',
          name: 'Tsuutatsu Page',
          component: () => import(/* webpackChunkName: "about" */ '../views/TsuutatsuPage.vue')
      
        },
        {
          path: 'CreateTsuutatsu',
          name: 'Create Tsuutatsu',
          // route level code-splitting
          // this generates a separate chunk (about.[hash].js) for this route
          // which is lazy-loaded when the route is visited.
          component: () => import(/* webpackChunkName: "about" */ '../views/CreateTsuutatsu.vue')
        },
        {
          path: 'EditTsuutatsuPage',
          name: 'Edit Tsuutatsu File',
          // route level code-splitting
          // this generates a separate chunk (about.[hash].js) for this route
          // which is lazy-loaded when the route is visited.
          component: () => import(/* webpackChunkName: "about" */ '../views/EditTsuutatsuPage.vue')
        },
        {
          path: 'TsuutatsuFullInformation',
          name: 'View Full Details',
          component: () => import(/* webpackChunkName: "about" */ '../views/TsuutatsuFullInformation.vue')
        },
        {
          path: 'TsuutatsuConfirmationPage',
          name: 'Tsuutatsu Confirmation Page',
          component: () => import(/* webpackChunkName: "about" */ '../views/TsuutatsuConfirmationPage.vue')
        },
        {
          path: 'TsuutatsuFullConfirmationDetails',
          name: 'Tsuutatsu Details Page',
          component: () => import(/* webpackChunkName: "about" */ '../views/TsuutatsuFullConfirmationDetails.vue')
        },
        {
          path: 'RingiPage',
          name: 'Ringi Page',
          component: () => import(/* webpackChunkName: "about" */ '../views/RingiPage.vue')
      
        },
        {
          path: 'RevisedRingiHistory',
          name: 'Revised Ringi History Page',
          component: () => import(/* webpackChunkName: "about" */ '../views/RevisedRingiHistory.vue')
      
        },
        {
          path: 'CreateRingi',
          name: 'Create Ringi Page',
          component: () => import(/* webpackChunkName: "about" */ '../views/CreateRingi.vue')
      
        },
        {
          path: 'RingiFullInformation',
          name: 'View Full Details',
          component: () => import(/* webpackChunkName: "about" */ '../views/RingiFullInformation.vue')
      
        },
        {
          path: 'EditRingiPage',
          name: 'Edit Ringi File',
          component: () => import(/* webpackChunkName: "about" */ '../views/EditRingiPage.vue')
      
        },
        {
          path: 'ReviseRingiPage',
          name: 'Revise Ringi File',
          component: () => import(/* webpackChunkName: "about" */ '../views/ReviseRingiPage.vue')
      
        },
        {
          path: 'EditRevisedRingiPage',
          name: 'Edit Revised Ringi File',
          component: () => import(/* webpackChunkName: "about" */ '../views/EditRevisedRingiPage.vue')
      
        },
        {
          path: 'KanrenPage',
          name: 'Kanren Page',
          component: () => import(/* webpackChunkName: "about" */ '../views/KanrenPage.vue')
      
        },
        {
          path: 'About',
          name: 'About',
          // route level code-splitting
          // this generates a separate chunk (about.[hash].js) for this route
          // which is lazy-loaded when the route is visited.
          component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
        },
        {
          path: 'UserAccountsMasterSettings',
          name: 'User Accounts Master Settings',
          // route level code-splitting
          // this generates a separate chunk (about.[hash].js) for this route
          // which is lazy-loaded when the route is visited.
          component: () => import(/* webpackChunkName: "about" */ '../views/UserAccountsMasterSettings.vue')
        },
        {
          path: 'TsuutatsuRulesCategory',
          name: 'Tsuutatsu Rules Category Master Settings',
          // route level code-splitting
          // this generates a separate chunk (about.[hash].js) for this route
          // which is lazy-loaded when the route is visited.
          component: () => import(/* webpackChunkName: "about" */ '../views/TsuutatsuRulesCategory.vue')
        },


        {
          path: 'Upload',
          name: 'Test Upload',
          // route level code-splitting
          // this generates a separate chunk (about.[hash].js) for this route
          // which is lazy-loaded when the route is visited.
          component: () => import(/* webpackChunkName: "about" */ '../views/Upload.vue')
        }
      ]
    },
    
  ]
})

router.beforeEach((to, from, next) => {
  if (to.path !== `/${i18n.locale}/SignIn`) {
    next()
    if(store.state.userInfo.username) {
      next()
    } else {
      next({path: `/${i18n.locale}/SignIn`})
    }
  }else{
    next()
  }
  
})

export default router;



