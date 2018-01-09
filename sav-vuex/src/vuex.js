class Store {
  constructor (optons = {}) {
    let {actions, mutations, state} = optons
    this.actions = actions
    this.mutations = mutations
    const store = this
    const computed = {}

    store._vm = new Vue({
      data: {
        $$state: state
      },
      computed
    })
  }

  get state () {
    return this._vm._data.$$state
  }

  set state (state) {
    this._vm._data.$$state = state
  }

  commit (mutation, options) {
    if (!this.mutations[mutation]) {
      console.error(`[vuex] unknown local mutation type: ${mutation}`)
      return
    }
    return this.mutations[mutation].call(null, this.state, options)
  }

  dispatch (action, options) {
    if (!this.actions[action]) {
      console.error(`[vuex] unknown local action type: ${action}`)
      return
    }
    const result = this.actions[action].call(null, {
      commit: this.commit.bind(this),
      state: this.state,
      dispatch: this.dispatch.bind(this)
    }, options)

    if (result && typeof result.then === 'function') {
      return result
    } else {
      return Promise.resolve(result)
    }
  }

  replaceState (state) {
    this._vm._data.$$state = state
  }
}

let Vue
function install (vue) {
  Vue = vue
  Vue.mixin({
    beforeCreate () {
      const options = this.$options
      if (options.store) {
        this.$store = options.store
      } else if (options.parent && options.parent.$store) {
        this.$store = options.parent.$store
      }
      let {getters, computed} = options
      if (getters) {
        computed || (computed = options.computed = {})
        let getterMaps = mapGetters(getters)
        Object.assign(computed, getterMaps)
      }
    }
  })
}

const normalizeMap = (map) => {
  return Array.isArray(map) ? map.map(key => {
    return {key: key, val: key}
  }) : Object.keys(map).map(key => {
    return {key: key, val: map[key]}
  })
}

export const mapGetters = (getters) => {
  const res = {}
  getters.forEach(item => {
    res[item] = function () {
      const result = this.$store._vm._data.$$state[item]
      return result
    }
  })
  return res
}

export const mapActions = (actions) => {
  let res = {}
  normalizeMap(actions).forEach((ref) => {
    let key = ref.key
    let val = ref.val
    res[key] = function mappedAction (payload) {
      return this.$store.dispatch(val, payload)
    }
  })
  return res
}

export default {
  install,
  Store
}
