<script setup lang="ts">
function login() {
  location.href = "/api/login"
}

</script>

<template>
  <PageHeader></PageHeader>
  <div class="container">
    <div class="mt-3 d-flex justify-content-evenly">
      <div>
        <button class="btn btn-kanon py-3 px-5" type="button" @click="login">Googleでログインする</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
