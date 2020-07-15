import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from "vuex-persistedstate";

Vue.use(Vuex)

export default new Vuex.Store({
  plugins: [createPersistedState()],
  state: {
    titlePage: '',
    userInfo: {},
    fileInfo: {},
    confirmationInfo: {},
    confirmationIndex: -1,
    revisedRingi: {}
  },
  mutations: {
    TITLE_PAGE:(state, val) => {
      state.titlePage = val
    },
    USER_INFO:(state, val)=>{
      state.userInfo = val
    },
    FILE_INFO:(state, val)=>{
      state.fileInfo = val
    },
    CONFIRMATION_INFO:(state, val)=>{
      state.confirmationInfo = val
    },
    CONFIRMATION_INDEX:(state, val)=>{
      state.confirmationIndex = val
    },
    REVISED_RINGI:(state, val)=>{
      state.revisedRingi = val
    },
  },
  actions: {
  },
  modules: {
  }
})
