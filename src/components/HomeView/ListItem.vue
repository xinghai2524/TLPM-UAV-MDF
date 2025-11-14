<script setup>
const props = defineProps(['x1', 'y1', 'x2', 'y2', 'conf', 'cls', 'resultId'])

const ClassNames = {
  0: 'class1',
  1: 'class2',
  2: '小绿叶蝉',
}

const topconf = ['bg-techGreen/20', 'text-techGreen']
const downconf = ['bg-techCyan/20', 'text-techCyan']
</script>

<template>
  <div class="bg-black/30 rounded p-3 hover:bg-black transition-all MyTransform select-none">
    <div class="flex justify-between items-center mb-1">
      <h3 class="text-white font-medium">{{ props.cls }} #{{ props.resultId }}</h3>
      <span
        class="text-xs px-2 py-0.5 rounded-full"
        :class="[...(props.conf < 0.5 ? downconf : topconf)]"
        >{{ props.conf < 0.5 ? '中度置信' : '高度置信' }}</span
      >
    </div>
    <div class="text-xs text-gray-400 grid grid-cols-2 gap-1">
      <div>置信度：{{ (props.conf * 100).toFixed(2) }}%</div>
      <div>坐标：({{ (props.x1).toFixed(2) }}, {{ (props.y1).toFixed(2) }})</div>
      <div>大小：&emsp;{{ (props.x2 - props.x1).toFixed(2) }}x{{ (props.y2 - props.y1).toFixed(2) }}</div>
      <div>{{ props.conf < 0.3 ? '' : '状态：已确认' }}</div>
    </div>
  </div>
</template>

<style>
.MyTransform {
  position: relative;
  transition: transform 0.3s ease;
}
.MyTransform:hover {
  transform: translateY(-3px);
}
</style>
