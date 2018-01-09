<template>
  <div class="todolist">
    <p>{{text}}</p>
    <p>city: {{city}}</p>
    <p>count：{{count}}</p>
    <button @click="increment">inc</button>
    <button @click="change">change</button>

  </div>
</template>

<script>
  import {mapActions} from '../dist/sav-vuex.cjs.js'
  export default {
    getters: [
      'city',
      'count'
    ],
    data () {
      return {
        text: 'hello vuex'
      }
    },
    methods: {
      ...mapActions([
        'inc',
        'changeCity'
      ]),
      increment () {
        this.inc()
      },
      change(){
        this.changeCity(this.city === '上海' ? '北京' : '上海')
      }
    }
  }
</script>