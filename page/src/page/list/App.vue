<script setup lang="ts">
import { computed } from 'vue';
import { onMounted, ref, reactive } from 'vue'

interface Data {
  name: string
  path: string
  image?: string
}
const overlay = ref(true)
const list: Data[] = []
const search = reactive({
  list,
  text: ""
})
onMounted(async () => {
  try {
    const res = await fetch('/api/files');
    const json: Data[] = await res.json()
    search.list = json
  } finally {
    overlay.value = false
  }
})

const filtered_list = computed(() => {
  const splited = search.text.split(/[ 　]/)
  return search.list.filter(data => {
    return splited.filter(word => data.name.indexOf(word) > -1).length == splited.length
  })
})
</script>

<template>
  <PageHeader :login="true" :overlay="overlay"></PageHeader>
  <div class="container mb-3">
    <div class="row row-cols-1">
      <div class="mb-3">
        <label for="search-text" class="form-label">Search Text</label>
        <div class="input-group">
          <span class="input-group-text" id="search-text-icon"><i class="bi bi-search"></i></span>
          <input type="text" class="form-control" id="search-text" v-model="search.text"/>
        </div>
      </div>
    </div>
  </div>
  <div class="container mb-3">
    <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
      <div class="col" v-for="data in filtered_list">
        <a :href="'/page/video/index.html#' + data.path" target="_blank" class="card shadow-sm">
          <img class="bd-placeholder-img card-img-top" width="100%" role="img" :src="data.image" v-if="data.image"/>
          <div class="card-body">
            <p class="card-text">{{ data.name }}</p>
          </div>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
