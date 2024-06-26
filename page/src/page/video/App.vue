<script setup lang="ts">
import Hls from 'hls.js'
import { onMounted } from 'vue'

onMounted(() => {
  const videoSrc = location.hash.substring(1)
  const video = document.getElementsByTagName('video')[0]
  if (Hls.isSupported()) {
    var hls = new Hls();
    hls.loadSource(videoSrc);
    hls.attachMedia(video);
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = videoSrc; //iOS等
    video.load()
  }
})
</script>

<template>
  <video id="video" controls autoplay></video>
</template>

<style>
video {
  max-width: 100%;
  max-height: 100%;
}
</style>
