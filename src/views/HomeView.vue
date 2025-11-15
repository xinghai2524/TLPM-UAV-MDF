<script setup>
import { ref, watch } from 'vue'
import ListItem from '../components/HomeView/ListItem.vue'
import RectDraw from '../components/HomeView/RectDraw.vue'
import * as inference from '../api/HomeView/InferenceAPI.js'

// 是否在electron中
const isElectron = window.versions
// canvas标签
const canvas = ref(null)
// video标签
const video = ref(null)
// input标签
const fileInput = ref(null)
// inputVideo标签
const videoInput = ref(null)
// 检测中间值
const xyxyxyInfo = ref([])
// 是否开启摄像头
const mediaDeviceStart = ref(false)

inference.setGlobalCanvas(canvas)
inference.setGlobalxyxyxyInfo(xyxyxyInfo)
inference.setGlobalVideo(video)
inference.setInferenceStatus(mediaDeviceStart)

// 图片检测
function inferenceImg(event) {
  // 如果正在视频检测
  clearnCanvas()
  inference.sendImage(event.target.files[0])
  fileInput.value.value = ''
}

// 摄像头检测
function cotrolMediaDeviceInference() {
  if (mediaDeviceStart.value) {
    mediaDeviceStart.value = false
  } else {
    clearnCanvas()
    navigator.mediaDevices
      .getUserMedia({
        video: { width: 1280, height: 720 },
      })
      .then((stream) => {
        video.value.srcObject = stream
      })
    mediaDeviceStart.value = true
    inference.sendFrame(video.value)
  }
}

// 视频检测
function inferenceVideo(event) {
  // 如果有视频在检测中
  clearnCanvas()

  // 如果没有内容就退出
  if (!event.target.files[0]) {
    return
  }

  mediaDeviceStart.value = true
  video.value.src = URL.createObjectURL(event.target.files[0])
  video.value.play()
  inference.sendFrame(video.value)
}

// 显示关闭方框
function selectRect(key) {
  xyxyxyInfo.value.forEach((value, index) => {
    if (index == key) {
      value.isShow = true
    } else {
      value.isShow = false
    }
  })
}

function allRect() {
  xyxyxyInfo.value.forEach((value) => {
    value.isShow = true
  })
}

// 同意初始化canvas,清空video的函数
function clearnCanvas() {
  mediaDeviceStart.value = false
  // 文件视频
  video.value.removeAttribute('src')
  // 摄像头视频
  video.value.srcObject?.getTracks().forEach((track) => track.stop())
  video.value.srcObject = undefined
  video.value.load()
}

// 监听如果停止就暂停播放视频
watch(mediaDeviceStart, (newVal) => {
  if (newVal == false) {
    video.value.pause()
  }
})

// 关闭系统
function windowClose() {
  if (window.System != undefined) {
    window.System.windowsClose()
  }
}
</script>

<template>
  <div class="font-cyber bg-techDark text-gray-200 min-h-screen">
    <video
      style="display: none"
      class="w-[640px] h-[640px] bg-amber-500"
      ref="video"
      @ended="mediaDeviceStart = false"
      autoplay
      id="video"
    ></video>
    <!-- 顶部状态栏 -->
    <header class="gradient-bg border-b border-techGreen/30 sticky top-0 z-50">
      <div
        class="container mx-auto px-4 py-3 flex justify-between items-center"
        style="-webkit-app-region: drag"
      >
        <!-- 左侧Logo -->
        <div class="flex items-center gap-3">
          <div>
            <h1
              class="text-[14px] lg:text-[15.5px] font-bold text-white text-shadow-glow select-none"
            >
              基于无人机多模态数据融合的
              <br />
              茶树小绿叶蝉虫害监测系统
            </h1>
          </div>
        </div>
        <!-- 右侧状态信息 -->
        <div class="flex items-center gap-6">
          <div class="items-center gap-2 select-none hidden md:flex">
            <i class="fa-solid fa-satellite-dish text-techCyan"></i>
            <!-- <span class="text-sm">无人机连接状态: <span class="text-red-500">已连接</span></span> -->
            <span class="text-sm">无人机状态：<span class="text-red-500">未连接</span></span>
          </div>
          <div class="items-center gap-2 select-none hidden lg:flex">
            <i class="fa-solid fa-server text-techPurple"></i>
            <span class="text-sm">模型: <span class="text-techCyan">YOLO11n-虫害专用版</span></span>
          </div>
          <button
            class="bg-techGreen/10 hover:bg-techGreen/20 text-techGreen border border-techGreen/50 px-3 py-1 rounded transition-all"
            style="-webkit-app-region: no-drag"
          >
            <i class="fa-solid fa-user-gear mr-1"></i> 控制台
          </button>
          <button
            :class="isElectron == undefined ? 'hidden' : 'block'"
            class="bg-red-500/30 hover:bg-red-500/45 text-red-500 border border-red-500/50 px-3 py-1 rounded transition-all"
            style="-webkit-app-region: no-drag"
            @click="windowClose"
          >
            <i class="fa-solid fa-arrow-right-from-bracket"></i> 退出
          </button>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="container mx-auto px-4 py-6">
      <!-- 核心检测区域，左右布局 -->
      <section class="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 左侧占用两列 -->
        <div
          class="lg:col-span-2 gradient-bg rounded-lg p-4 border border-techGreen/30 border-glow relative"
        >
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-white flex items-center gap-2 select-none">
              <i class="fa-solid fa-camera-retro text-techGreen text-shadow-glow"></i>
              实时图像检测
            </h2>
            <div class="flex gap-2">
              <button
                v-if="!mediaDeviceStart"
                class="bg-techGreen/10 hover:bg-techGreen/20 text-techGreen border border-techGreen/50 px-3 py-1 rounded text-sm transition-all"
                @click="cotrolMediaDeviceInference"
              >
                <i class="fa-solid fa-play mr-1"></i>
                开始检测
              </button>
              <button
                v-if="mediaDeviceStart"
                class="bg-techCyan/10 hover:bg-techCyan/20 text-techCyan border border-techCyan/50 px-3 py-1 rounded text-sm transition-all"
                @click="cotrolMediaDeviceInference"
              >
                <i class="fa-solid fa-stop mr-1"></i>
                停止检测
              </button>

              <!-- 上传图片 -->
              <input
                class="hidden"
                name="inputImage"
                type="file"
                ref="fileInput"
                accept="image/*"
                @change="inferenceImg"
              />
              <input
                class="hidden"
                name="inputVideo"
                type="file"
                ref="videoInput"
                accept="video/*"
                @change="inferenceVideo"
              />
              <button
                class="bg-gray-700/50 hover:bg-gray-700/70 text-gray-300 border border-gray-600 px-3 py-1 rounded text-sm transition-all"
                @click.stop="
                  () => {
                    mediaDeviceStart = false
                    videoInput.click()
                    videoInput.value = ''
                  }
                "
              >
                <i class="fa-solid fa-file-video mr-1"></i>
                上传视频
              </button>

              <button
                class="bg-gray-700/50 hover:bg-gray-700/70 text-gray-300 border border-gray-600 px-3 py-1 rounded text-sm transition-all"
                @click.stop="
                  () => {
                    fileInput.click()
                    mediaDeviceStart = false
                  }
                "
              >
                <i class="fa-solid fa-upload mr-1"></i>
                上传图像
              </button>
            </div>
          </div>
          <!-- 检测图像显示区 -->
          <div
            class="relative w-full aspect-video bg-black/50 rounded-lg overflow-hidden border border-gray-700 select-none"
          >
            <canvas class="bg-techDark w-full h-full" ref="canvas"></canvas>
            <RectDraw
              v-for="(value, index) in xyxyxyInfo"
              :key="index"
              :x1="value.x1"
              :y1="value.y1"
              :x2="value.x2"
              :y2="value.y2"
              :conf="value.conf"
              :cls="value.cls"
              :isShow="value.isShow"
            ></RectDraw>
          </div>
          <!-- 检测统计信息 -->
          <div class="grid grid-cols-3 gap-4 mt-4 select-none">
            <div class="text-center p-2 bg-black/30 rounded">
              <p class="text-xs text-gray-400">目标检测数</p>
              <p class="text-xl font-bold text-techGreen">{{ xyxyxyInfo.length }}</p>
            </div>
            <div class="text-center p-2 bg-black/30 rounded">
              <p class="text-xs text-gray-400">疑似目标数</p>
              <p class="text-xl font-bold text-techCyan">
                {{
                  xyxyxyInfo.filter((event) => {
                    return event.conf < 0.5 && event.conf > 0.3
                  }).length
                }}
              </p>
            </div>
            <div class="text-center p-2 bg-black/30 rounded">
              <p class="text-xs text-gray-400">误检率</p>
              <p class="text-xl font-bold text-techPurple">
                {{
                  (xyxyxyInfo.length == 0
                    ? 0
                    : +xyxyxyInfo.filter((event) => {
                        return event.conf < 0.3
                      }).length / xyxyxyInfo.length
                  ).toFixed(2)
                }}%
              </p>
            </div>
          </div>
        </div>
        <!-- 右侧：检测结果与控制区（占1列） -->
        <div class="flex flex-col gap-4">
          <!-- 结果列表 -->
          <div
            class="gradient-bg rounded-lg p-4 border border-techGreen/30 border-glow flex-1"
            @mouseleave="allRect(index)"
          >
            <h2 class="text-xl font-bold text-white flex items-center gap-2 mb-4 select-none">
              <i class="fa-solid fa-list-check text-techGreen text-shadow-glow"></i>
              检测列表
            </h2>
            <!-- 滚动列表 -->
            <div class="space-y-3 max-h-110 xl:max-h-130 overflow-y-auto">
              <ListItem
                v-if="!mediaDeviceStart"
                v-for="(value, index) in xyxyxyInfo"
                :x1="value.x1"
                :x2="value.x2"
                :y1="value.y1"
                :y2="value.y2"
                :conf="value.conf"
                :cls="value.cls"
                :resultId="index"
                @mouseenter="selectRect(index)"
              ></ListItem>

              <ListItem
                v-if="mediaDeviceStart"
                :x1="0"
                :x2="0"
                :y1="0"
                :y2="0"
                :conf="1"
                :cls="0"
                :resultId="0"
              ></ListItem>
            </div>
          </div>
        </div>
      </section>
      <!-- 1. 数据概览仪表盘 -->
      <section class="mb-8">
        <div class="flex justify-between items-center mb-4 select-none">
          <h2 class="text-xl font-bold text-white flex items-center gap-2">
            <i class="fa-solid fa-chart-pie text-techGreen text-shadow-glow"></i>
            实时数据概览
          </h2>
          <div class="text-sm text-gray-400 flex items-center gap-1">
            <i class="fa-solid fa-clock"></i> 最后更新: 2024-05-20 14:32:15
          </div>
        </div>
        <!-- 数据卡片组 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- 卡片1：检测区域 -->
          <div
            class="gradient-bg rounded-lg p-4 border border-techGreen/30 border-glow card-hover select-none"
          >
            <div class="flex justify-between items-start mb-3">
              <h3 class="text-gray-300 text-sm">检测茶园面积</h3>
              <i class="fa-solid fa-map-location-dot text-techGreen/70"></i>
            </div>
            <p class="text-3xl font-bold text-white">
              12.8 <span class="text-lg text-techGreen">公顷</span>
            </p>
            <div class="mt-2 flex items-center text-xs text-gray-400">
              <i class="fa-solid fa-arrow-up text-red-400 mr-1"></i>
              <span>较昨日 +0.3 公顷</span>
            </div>
          </div>
          <!-- 卡片2：虫害数量 -->
          <div
            class="gradient-bg rounded-lg p-4 border border-techGreen/30 border-glow card-hover select-none"
          >
            <div class="flex justify-between items-start mb-3">
              <h3 class="text-gray-300 text-sm">小绿叶蝉检测数</h3>
              <i class="fa-solid fa-bug text-techCyan/70"></i>
            </div>
            <p class="text-3xl font-bold text-white">
              376 <span class="text-lg text-techCyan">只</span>
            </p>
            <div class="mt-2 flex items-center text-xs text-gray-400">
              <i class="fa-solid fa-arrow-down text-techGreen mr-1"></i>
              <span>较昨日 -12.5%</span>
            </div>
          </div>
          <!-- 卡片3：虫害等级 -->
          <div
            class="gradient-bg rounded-lg p-4 border border-techGreen/30 border-glow card-hover select-none"
          >
            <div class="flex justify-between items-start mb-3">
              <h3 class="text-gray-300 text-sm">虫害发生等级</h3>
              <i class="fa-solid fa-triangle-exclamation text-techPurple/70"></i>
            </div>
            <p class="text-3xl font-bold text-white">
              轻度 <span class="text-lg text-techPurple">发生</span>
            </p>
            <div class="mt-2 flex items-center text-xs text-gray-400">
              <span>风险阈值：<span class="text-white">500只/公顷</span></span>
            </div>
          </div>
          <!-- 卡片4：检测准确率 -->
          <div
            class="gradient-bg rounded-lg p-4 border border-techGreen/30 border-glow card-hover select-none"
          >
            <div class="flex justify-between items-start mb-3">
              <h3 class="text-gray-300 text-sm">模型检测准确率</h3>
              <i class="fa-solid fa-check-double text-techGreen/70"></i>
            </div>
            <p class="text-3xl font-bold text-white">
              98.3 <span class="text-lg text-techGreen">%</span>
            </p>
            <div class="mt-2 flex items-center text-xs text-gray-400">
              <i class="fa-solid fa-arrow-up text-techGreen mr-1"></i>
              <span>较上版本 +1.2%</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.border-glow {
  box-shadow:
    0 0 5px #39ff14,
    inset 0 0 5px #aafa9c88;
}

.text-shadow-glow {
  text-shadow:
    0 0 8px #39ff14,
    0 0 20px #37ff147e;
}

.gradient-bg {
  background: linear-gradient(135deg, #050f1a, #0a1929);
}

#canvas {
  display: block;
  margin: auto;
  width: 70%;
  aspect-ratio: 16 / 9;
  background: rgb(0, 0, 0);
}

.card-hover {
  transition: all 0.3s ease;
}

.card-hover:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px -5px #26ff0059;
}
</style>
