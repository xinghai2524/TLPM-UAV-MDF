<script setup>


const props = defineProps(["xyxyxy", 'resultId'])
let {x1, y1, x2, y2, conf, cls} = props.xyxyxy
x1 = x1.toFixed(2)
x2 = x2.toFixed(2)
y1 = y1.toFixed(2)
y2 = y2.toFixed(2)
conf = conf.toFixed(2) 
const ClassNames = {
  0:"class1",
  1:"class2",
  2:"小绿叶蝉"
}

const topconf = ['bg-techGreen/20', 'text-techGreen']
const downconf = ['bg-techCyan/20', 'text-techCyan']
</script>

<template>
  <div class="bg-black/30 rounded p-3 hover:bg-black transition-all MyTransform select-none">
    <div class="flex justify-between items-center mb-1">
      <h3 class="text-white font-medium">{{ cls }} #{{ props.resultId }}</h3>
      <span
        class="text-xs px-2 py-0.5 rounded-full"
        :class="[...(+conf < 0.5 ? downconf : topconf)]"
        >{{ +conf < 0.5 ? '中度置信' : '高度置信' }}</span
      >
    </div>
    <div class="text-xs text-gray-400 grid grid-cols-2 gap-1">
      <div>置信度: {{ +conf * 100 }}%</div>
      <div>坐标: ({{ x1 }}, {{ y1 }})</div>
      <div>大小: {{ (x2-x1).toFixed(2) }}x{{ (y2-y1).toFixed(2)  }}</div>
      <div>{{ +conf < 0.30 ? '' : '状态:已确认' }}</div>
    </div>
  </div>
</template>

<style>
.MyTransform{
  position:relative;
  transition: transform 0.3s ease;
}
.MyTransform:hover{
  transform: translateY(-3px);
}
</style>
