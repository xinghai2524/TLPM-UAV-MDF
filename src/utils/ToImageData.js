canvas = document.createElement("canvas")

export async function FileToImageData(file, INPUT_WIDTH, INPUT_HEIGHT) {
  // 获取inputData
  const img = new Image()
  img.src = URL.createObjectURL(file)
  await new Promise((resolve) => img.onload = resolve)
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, INPUT_WIDTH, INPUT_HEIGHT)
  return ctx.getImageData(0, 0, INPUT_WIDTH, INPUT_HEIGHT)
}

export async function VideoToImageData(video, INPUT_WIDTH, INPUT_HEIGHT) {
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, INPUT_WIDTH, INPUT_HEIGHT)
  return ctx.getImageData(0, 0, INPUT_WIDTH, INPUT_HEIGHT)
}

