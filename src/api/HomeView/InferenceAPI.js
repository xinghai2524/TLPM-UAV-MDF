
// 逻辑抽离，接收canvas，video，image，xyxyxyInfo
const isElectron = window.versions
let inference = null;
let globalCanvas = null;
let globalxyxyxyInfo = null;
let globalVideo = null;
let inferenceStatus = null
let globalImage = {};

export function setInferenceStatus(mediaDeviceStart) {
  inferenceStatus = mediaDeviceStart
}

export function setGlobalCanvas(canvas) {
  globalCanvas = canvas
}

export function setGlobalxyxyxyInfo(xyxyxyInfo) {
  globalxyxyxyInfo = xyxyxyInfo
}

export function setGlobalVideo(video) {
  globalVideo = video
}



export function stopInference() {
  inferenceStatus.value = false
}


if (isElectron == undefined) {
  await import('./InferenceWork').then((module) => {
    inference = new Worker(new URL("./InferenceWork.js", import.meta.url), { type: 'module' })
    console.log('你在浏览器')
  })
} else {
  await import('./electronInference').then((module) => {
    inference = new module.Inference()
    console.log('你在electron')
  })
}



// 初始化
const canvas = document.createElement('canvas')
const INPUT_WIDTH = 640
const INPUT_HEIGHT = 640


// 创建回调函数
export async function onmessage(resolve = () => { }) {
  inference.onmessage = (data) => {
    resolve(data.data, globalImage.img, globalImage.img_width, globalImage.img_height);
  }
}



// 图像检测，获取file，获取得到ImageData，传给worker，worker回调函数将
export async function sendImage(file) {
  // 获取inputData
  const img = new Image()
  img.src = URL.createObjectURL(file);
  await new Promise((resolve) => { img.onload = resolve })
  canvas.width = INPUT_WIDTH;
  canvas.height = INPUT_HEIGHT;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, 640, 640)
  const imageData = ctx.getImageData(0, 0, 640, 640)
  globalImage.img = img
  globalImage.img_width = img.width
  globalImage.img_height = img.height
  console.log("图片检测。。。")
  inference.postMessage([imageData, img.width, img.height, INPUT_WIDTH, INPUT_HEIGHT])
}

// 视频检测，获取file，获取得到ImageData，传给worker，worker回调函数将
export async function sendFrame(video) {
  canvas.width = INPUT_WIDTH;
  canvas.height = INPUT_HEIGHT;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(video, 0, 0, 640, 640)
  const imageData = ctx.getImageData(0, 0, 640, 640)
  globalImage.img = video
  globalImage.img_width = video.videoWidth
  globalImage.img_height = video.videoHeight
  inference.postMessage([imageData, video.videoWidth, video.videoHeight, INPUT_WIDTH, INPUT_HEIGHT])
}


// 回调函数
onmessage((xyxyxy, img, img_width, img_height) => {
  console.log("回调函数")
  drawRect(img, img_width, img_height, xyxyxy)

  if (inferenceStatus.value) {
    requestAnimationFrame(() => {
      sendFrame(globalVideo.value)
    })
  }

})

// 检测后回调函数,用于更新UI信息
function drawRect(img, img_width, img_height, xyxyxy) {
  console.log(img_width, img_height)
  // 获取最长的边
  const proportion = 16 / 9
  let start_x
  let start_y
  if (img_width > img_height) {
    globalCanvas.value.width = img_width
    globalCanvas.value.height = img_width / proportion
    start_x = 0
    start_y = (globalCanvas.value.height - img_height) / 2
  } else {
    globalCanvas.value.height = img_height
    globalCanvas.value.width = img_height * proportion
    start_x = (globalCanvas.value.width - img_width) / 2
    start_y = 0
  }
  console.log(globalCanvas.value.width, globalCanvas.value.height)

  const ctx = globalCanvas.value.getContext('2d')

  // 绘制到canvas中
  ctx.drawImage(img, start_x, start_y, img_width, img_height)

  // 计算坐标百分比
  globalxyxyxyInfo.value = []
  xyxyxy.forEach((element, index) => {
    let [x1, y1, x2, y2, conf, cls] = element
    x1 = +(((x1 + start_x) / globalCanvas.value.width) * 100)
    x2 = +(((x2 + start_x) / globalCanvas.value.width) * 100)
    y1 = +(((y1 + start_y) / globalCanvas.value.height) * 100)
    y2 = +(((y2 + start_y) / globalCanvas.value.height) * 100)
    globalxyxyxyInfo.value.push({ x1: x1, y1: y1, x2: x2, y2: y2, conf: conf, cls: cls, isShow: true })
  })
}
