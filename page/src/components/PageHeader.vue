<template>
  <div class="position-fixed" id="overlay" v-show="overlay || sessionoverlay">
    <div class="position-absolute top-50 start-50 translate-middle">
      <div class="spinner-border" role="status">
        <span class="sr-only"></span>
      </div>
    </div>
  </div>
  <header class="mb-3">
    <div class="navbar" id="pageheader">
      <div class="container d-flex justify-content-between">
        <div class="navbar-brand">
          <span>Movie Server</span>
        </div>
        <div>
          <span>{{ name }}</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { ref } from 'vue'

const define = defineProps({
  'login': {type: Boolean, default: false},
  'overlay': {type: Boolean, default: false},
})

const name = ref('')
const sessionoverlay = ref(true)
onMounted(async () => {
  if (define.login) {
    try {
      const res = await fetch('/api/session')
      if (res.status != 200) {
        location.href = '/page/login/index.html'
        return
      }
      const json: {name: string} = await res.json()
      name.value = json.name
    } finally {
      sessionoverlay.value = false
    }
  } else {
    sessionoverlay.value = false
  }
})
</script>

<style scoped>
#pageheader {
  background-color: #da57d8;
}
#overlay {
  width: 100%;
  height: 100%;
  opacity: 0.5;
  background-color: gray;
  z-index:9999;
  color: white;
}
</style>