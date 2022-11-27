// @ts-nocheck
import { App } from 'vue'
import { setupDevtools } from './devtools'

// Our plugin
const data = {}

export default {
  install (app: App, options = {}) {
    let devtools: ReturnType<typeof setupDevtools>
    if (process.env.NODE_ENV === 'development' || __VUE_PROD_DEVTOOLS__) {
      devtools = setupDevtools(app, data)
    }
  },
  create(name: string, store = {}) {
    data[name] = store
  },
  list(scope, prop, val) {
    if (!data[scope])
      data[scope] = {}
    data[scope][prop] = val
  }
}
