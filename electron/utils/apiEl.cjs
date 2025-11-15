const { ipcMain, app } = require('electron')
const ort = require('onnxruntime-node')
const path = require('path')


// 初始化
let modelPath = null;
if (app.isPackaged) {
  modelPath = path.join(process.resourcesPath, "app.asar.unpacked", "public", "TLPM-UAV-MDF.onnx")
} else {
  modelPath = path.join(__dirname, '../../public/TLPM-UAV-MDF.onnx');
}

let session = null
ort.InferenceSession.create(modelPath).then((result) => {
  session = result
})

// 接口
ipcMain.handle('ping', () => 'pong')
ipcMain.handle('detel', InferenceRun)
ipcMain.on("window-close", () => {
  app.exit();
})




async function InferenceRun(event, float32Array, img_width, img_height, INPUT_WIDTH, INPUT_HEIGHT) {

  if (session == null) {
    event.sender.send("message", "没有初始化")
    console.log("没有初始化")
  }


  // float32转成ort.tensor
  const inputTensor = new ort.Tensor("float32", float32Array, [1, 3, INPUT_HEIGHT, INPUT_WIDTH])
  // 创建输入对象
  const inputName = session.inputNames[0]
  const outputName = session.outputNames[0]
  const feeds = {}
  feeds[inputName] = inputTensor

  // 推理
  const results = await session.run(feeds);
  const result = results[outputName]
  const resultData = result.data

  // 处理resultData
  const xyxyxy = [];
  for (let i = 0; i < result.dims[1]; i += 6) {
    let [x1, y1, x2, y2, conf, cls] = resultData.slice(i, i + 6);
    if (conf < 0.2) {
      continue;
    }
    x1 = x1 * img_width / INPUT_WIDTH;
    x2 = x2 * img_width / INPUT_WIDTH;
    y1 = y1 * img_height / INPUT_HEIGHT;
    y2 = y2 * img_height / INPUT_HEIGHT;
    xyxyxy.push([x1, y1, x2, y2, conf, cls])
  }

  return { data: xyxyxy }
}
