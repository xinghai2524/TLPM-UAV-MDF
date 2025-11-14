
console.log(versions.chrome())
console.log(versions.node())
console.log(versions.electron())
console.log(await versions.ping())

export class Inference {
  onmessage = () => { }

  async postMessage([imageData, img_width, img_height, INPUT_WIDTH, INPUT_HEIGHT]) {
    const { data, width, height } = imageData
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

    const xyxyxy = await ApiEl.detel(tensor, img_width, img_height, INPUT_WIDTH, INPUT_HEIGHT)
    this.onmessage(xyxyxy)
  }

}
