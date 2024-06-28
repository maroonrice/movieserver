<template>
  <PageHeader></PageHeader>
  <div class="container">
    <div class="alert alert-danger" role="alert" v-if="message">{{ message }}</div>
    <div class="mt-3 d-flex justify-content-evenly">
      <div><a href="/page/login/index.html">ログインページへ</a></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const message = ref("")
onMounted(() => {
  location.search.substring(1).split("&").map(kv => kv.split("=")).filter(kv => kv.length == 2).filter(kv => kv[0] == 'message').forEach((v) => {
    message.value = decodeURIComponent(v[1])
  })
})
</script>

<style scoped>
</style>
