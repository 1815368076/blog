import Vue from 'vue'
import Vuex from '../src'
import App from './App.vue'

Vue.use(Vuex)
let store = new Vuex.Store({
  state: {
    count: 1000,
    city: '上海'
  },
  mutations: {
    inc(state) {
      return state.count++
    },
    updateCity(state, city) {
      state.city = city
      return state.city
    }
  },
  actions: {
    inc({commit}) {
      commit('inc')
    },
    changeCity({commit}, city) {
      commit('updateCity', city)
    }
  }
})

let vm = new Vue({
  store,
  ...App
})
vm.$mount('#app')