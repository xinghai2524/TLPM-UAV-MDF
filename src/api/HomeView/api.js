import * as ort from 'onnxruntime-web';

// 设置wasm路径
ort.env.wasm.wasmPaths = {
  "ort-wasm-simd-threaded.wasm": new URL('../../../public/ort-wasm-simd-threaded.wasm', import.meta.url).pathname,
  "ort-wasm-simd.wasm": new URL('../../../public/ort-wasm-simd.wasm', import.meta.url).pathname,
  "ort-wasm-threaded.wasm": new URL('../../../public/ort-wasm-threaded.wasm', import.meta.url).pathname,
  "ort-wasm.wasm": new URL('../../../public/ort-wasm.wasm', import.meta.url).pathname
}

// 创建模型
const model = new URL('../../../public/yolo11n.onnx', import.meta.url).pathname;
const Globalsession = await ort.InferenceSession.create(model)


export class Inference {
  INPUT_HEIGHT = 640;
  INPUT_WIDTH = 640;
  session = Globalsession;
  sessionInputName = this.session.inputNames[0]
  sessionOutputName = this.session.outputNames[0]
  canvas = document.createElement('canvas');

  async InferenceImage(File, resourceCanvas = undefined, resolve = () => { }) {

    // 转成Image对象
    const img = new Image();
    img.src = URL.createObjectURL(File);
    await new Promise((resolve) => { img.onload = resolve })
    // 推理出坐标信息
    const xyxyxy = await this.#InferenceRun(img, img.width, img.height)
    // 绘制到canvas上面
    await this.#DrawImage(img, resourceCanvas, xyxyxy, img.width, img.height)
    resolve({ img: img, xyxyxy: xyxyxy })
  }

  async InferenceVideo(video, resourceCanvas = undefined, resolve = () => { }) {
    const xyxyxy = await this.#InferenceRun(video, video.videoWidth, video.videoHeight)
    await this.#DrawImage(video, resourceCanvas, xyxyxy, video.videoWidth, video.videoHeight)
    resolve({ img: video, xyxyxy: xyxyxy })
  }

  async #DrawImage(resouceImage, resourceCanvas, xyxyxy, img_width, img_height) {
    // 获取canvas的css宽高比
    const proportion = resourceCanvas.offsetWidth / resourceCanvas.offsetHeight
    // 获取图片最长的边，如果一样长，就默认width为最长
    let start_x;
    let start_y;
    if (img_width >= img_height) {
      resourceCanvas.width = img_width;
      resourceCanvas.height = img_width / proportion
      start_x = 0;
      start_y = (resourceCanvas.height - img_height) / 2
    } else {
      resourceCanvas.height = img_height;
      resourceCanvas.width = img_height * proportion;
      start_x = (resourceCanvas.width - img_width) / 2
      start_y = 0;
    }
    const ctx = resourceCanvas.getContext("2d", { willReadFrequently: true });
    ctx.strokeStyle = "red";
    ctx.lineWidth = img_width / 100
    ctx.drawImage(resouceImage, start_x, start_y, img_width, img_height);
    // 绘制坐标
    xyxyxy.forEach(element => {
      let [x1, y1, x2, y2, conf, cls] = element;
      x1 = x1 + start_x;
      x2 = x2 + start_x;
      y1 = y1 + start_y;
      y2 = y2 + start_y;
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1)
    });

  }

  async #InferenceRun(source, img_width, img_height) {
    // 创建canvas对象
    const canvas = this.canvas;
    canvas.width = this.INPUT_WIDTH;
    canvas.height = this.INPUT_HEIGHT
    const ctx = canvas.getContext("2d", { willReadFrequently: true })

    // 绘制到canvas上面
    ctx.drawImage(source, 0, 0, this.INPUT_WIDTH, this.INPUT_HEIGHT);

    // 获取像素上的所有字节
    const { data, width, height } = ctx.getImageData(0, 0, this.INPUT_WIDTH, this.INPUT_HEIGHT)

    // 创建一个Float32Array对象用于存储标准结构
    const tensor = new Float32Array(3 * width * height)

    // 转换成tensor
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4
        tensor[y * width + x] = data[idx + 0] / 255
        tensor[width * height + y * width + x] = data[idx + 1] / 255
        tensor[2 * width * height + y * width + x] = data[idx + 2] / 255
      }
    }

    const inputTensor = new ort.Tensor("float32", tensor, [1, 3, this.INPUT_HEIGHT, this.INPUT_WIDTH])

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
      if (conf < 0.25) {
        continue;
      }
      x1 = Math.trunc(x1 * img_width / this.INPUT_WIDTH)
      x2 = Math.trunc(x2 * img_width / this.INPUT_WIDTH)
      y1 = Math.trunc(y1 * img_height / this.INPUT_HEIGHT)
      y2 = Math.trunc(y2 * img_height / this.INPUT_HEIGHT)
      xyxyxy.push([x1, y1, x2, y2, conf, cls])
    }
    return xyxyxy
  }

}
