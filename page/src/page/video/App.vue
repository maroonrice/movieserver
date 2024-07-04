<script setup lang="ts">
import Hls from 'hls.js'
import { onMounted, reactive } from 'vue'

class VideoData {
  playlist: Array<PlayData> = []
}

interface PlayData {
  name: string
  time: number
}

onMounted(async () => {
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
  const play_res = await fetch(videoSrc.replace('video.m3u8','video.json'))
  if (play_res.status == 200) {
    const video_json: VideoData = await play_res.json()
    Object.assign(videoData, video_json)
  }
})

function seek(time: number) {
  const video = document.getElementsByTagName('video')[0]
  const status = video.paused
  video.currentTime = time
  if (status) {
    video.pause()
  }
}

const videoData = reactive(new VideoData())
</script>

<template>
  <video id="video" controls autoplay></video>
  <div class="container mt-3" v-if="videoData.playlist.length > 0">
    <div class="row">
      <div class="col">
        <button v-for="fetch in videoData.playlist" type="button" class="btn btn-chisato mb-3 me-3" @click="seek(fetch.time)">{{ fetch.name }}</button>
      </div>
    </div>
  </div>
</template>

<style>
video {
  max-width: 100%;
  max-height: 100%;
}
</style>
