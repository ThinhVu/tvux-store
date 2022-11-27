# Tvux-Store

A pinia alternative store.

### Notice
The plugin is not build for SSR use.

Usage in app:

`/src/store/user`
```javascript
// define store
import TvuxStore from 'tvux-store';
import {ref, computed} from 'vue';

export const userStore = {
  username: ref('tvux'),
  password: ref('123456'),
  firstName: 'Thinh',
  lastName: 'Vu',
  fullName: computed(() => `${userStore.firstName} ${userStore.lastName}`),
  age: 30,
  maried: false,
  address: { line1: 'Duy tan' },
  signIn: () => console.log('sign in'),
  signOut: () => console.log('sign out'),
}

export const init = () => TvuxStore.create('userStore', userStore)
```

```javascript
// main.js 
import {createApp} from 'vue';
import {createRouter, createWebHistory} from 'vue-router';
import TvuxStore from 'tvux-store';
import App from './App.vue';
import {init} from '@/store/user';

function initApp() {
  const app = createApp(App);
  const router = createRouter({
    history: createWebHistory(),
    routes: []
  }, {default: '/'})
  app.use(router);
  app.use(TvuxStore);
  router.isReady().then(() => {
    init()
    app.mount('#app')
  })
}

initApp() 
```

```vue
<template>
  <div>{{userStore.fullName}}</div>
</template>
<script setup>
import {userStore} from '@/store/user'
</script>
```

```javascript
// list reactivity variable in vue dev tools for easier to inspect
import TvuxStore from 'tvux-store';
import {ref} from 'vue'
const age = ref(30)
TvuxStore.list('person', 'age', age)
```
