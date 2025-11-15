import * as ort from 'onnxruntime-web';

// 设置wasm路径
ort.env.wasm.wasmPaths = {
  "ort-wasm-simd-threaded.wasm": new URL('../../../public/ort-wasm-simd-threaded.wasm', import.meta.url).pathname,
  "ort-wasm-simd.wasm": new URL('../../../public/ort-wasm-simd.wasm', import.meta.url).pathname,
  "ort-wasm-threaded.wasm": new URL('../../../public/ort-wasm-threaded.wasm', import.meta.url).pathname,
  "ort-wasm.wasm": new URL('../../../public/ort-wasm.wasm', import.meta.url).pathname
}

// 创建模型
const model = new URL('../../../public/TLPM-UAV-MDF.onnx', import.meta.url).pathname;
const Globalsession = await ort.InferenceSession.create(model)


export class Inference {
  session = Globalsession;
  sessionInputName = this.session.inputNames[0]
  sessionOutputName = this.session.outputNames[0]

  async InferenceRun(imageData, img_width, img_height, INPUT_WIDTH, INPUT_HEIGHT) {
    // 获取像素上的所有字节
    const { data, width, height } = imageData

    // 创建一个Float32Array对象用于存储标准结构
    const tensor = new Float32Array(3 * 640 * 640)

    // 转换成tensor

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4
        tensor[y * width + x] = data[idx + 0] / 255
        tensor[width * height + y * width + x] = data[idx + 1] / 255
        tensor[2 * width * height + y * width + x] = data[idx + 2] / 255
      }
    }

    const inputTensor = new ort.Tensor("float32", tensor, [1, 3, height, width])

    // 创建输入对象
    const feeds = {};
    feeds[this.sessionInputName] = inputTensor;

    // 推理图片
    const results = await this.session.run(feeds)
    const result = results[this.sessionOutputName]
    const resultData = result.data

    // 获取坐标
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
    return xyxyxy
  }

}


// 执行函数
const inference = new Inference()
self.onmessage = (data) => {
  inference.InferenceRun(...data.data).then((xyxyxy) => {
    self.postMessage(xyxyxy)
  })
}
