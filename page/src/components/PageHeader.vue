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
          <span>Used: {{ usedGB }} / Total: {{ totalGB }}</span>
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
import { ref, reactive, computed } from 'vue'

const define = defineProps({
  'login': {type: Boolean, default: false},
  'overlay': {type: Boolean, default: false},
})

class Disk {
  total = 0
  used = 0
  free = 0
}

const name = ref('')
const sessionoverlay = ref(true)
const disk = reactive(new Disk())
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
      const disk_res = await fetch('/api/disk')
      if (res.status == 200) {
        const disk_json: Disk = await disk_res.json()
        Object.assign(disk, disk_json)
      }
    } finally {
      sessionoverlay.value = false
    }
  } else {
    sessionoverlay.value = false
  }
})

const totalGB = computed(() => {
  return dispGB(disk.total)
})
const usedGB = computed(() => {
  return dispGB(disk.used)
})

function dispGB(num: number) {
  return (Math.floor(num / 1024 / 1024 / 1024 * 10) / 10) + 'GB'
}
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