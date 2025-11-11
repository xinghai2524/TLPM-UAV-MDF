<script setup>
import { Inference } from '../api/HomeView/api'

import { onMounted, ref } from 'vue'

const inference = new Inference()
const canvas = ref(null)

// 图像检测
function inferenceImg(event) {
  if (event.target.files.length !== 1) {
    return
  }
  inference.InferenceImage(event.target.files[0], canvas.value)
}

// 摄像头逻辑
const video = ref(null)
// 初始化摄像头
onMounted(() => {
  navigator.mediaDevices
    .getUserMedia({
      video: { width: 1280, height: 720 },
    })
    .then((stream) => {
      video.value.srcObject = stream
    })
})

function testClick() {
  inference.InferenceVideo(video.value, canvas.value,resolve)
}

function resolve() {
  requestAnimationFrame(() => {
    inference.InferenceVideo(video.value, canvas.value,resolve)
  })
}
</script>

<template>
  <canvas id="canvas" ref="canvas"></canvas>
  <h1>摄像头</h1>
  <hr />
  <button @click="testClick">摄像头检测</button>
  <div></div>
  <input type="file" accepti="image/*" id="inputImage" @change="inferenceImg" />
  <br />
  <video ref="video" autoplay playsinline style="width: 300px"></video>
  <div>Hello World</div>
</template>

<style scoped>
#canvas {
  display: block;
  margin: auto;
  width: 70%;
  aspect-ratio: 16 / 9;
  background: rgb(0, 0, 0);
}
</style>
