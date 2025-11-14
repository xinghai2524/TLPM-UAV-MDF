<script setup>
const props = defineProps(['x1', 'y1', 'x2', 'y2', 'conf', 'cls', 'isShow'])
</script>

<template>
  <div
    v-show="props.isShow"
    :style="{ top: `${props.y1 - 4.5}%`, left: `${props.x1}%` }"
    class="absolute bg-techGreen/90 text-black text-xs px-1 rounded font-thin"
    :title="`${props.cls} (置信度: ${props.conf.toFixed(2)})`"
  >
    {{ props.cls }} {{ props.conf.toFixed(2) }}
  </div>
  <div
    v-show="props.isShow"
    :style="{
      top: `${props.y1}%`,
      left: `${props.x1}%`,
      width: `${(props.x2 - props.x1).toFixed(2)}%`,
      height: `${(props.y2 - props.y1).toFixed()}%`,
    }"
    class="absolute border-2 border-techGreen border-glow bg-techGreen/10"
    :title="`${props.cls} (置信度: ${props.conf.toFixed(2)})`"
  ></div>
</template>
