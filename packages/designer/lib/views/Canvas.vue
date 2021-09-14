<script lang="ts" setup>
import { reactive, ref, watch, onMounted, unref } from "@vue/composition-api";
// import { useBox, useCanvas } from "./mixins";

// useBox("workspace", {
//   layoutType: "off",
//   // mainAlign: parentProps.mainAlign,
//   // mainArrange: parentProps.mainArrange,
//   // stackVertical: parentProps.stackVertical,
//   // gridColX: parentProps.gridColX,
//   // gridColY: parentProps.gridColY,
// });

const props = defineProps({
  zoom: { type: Number, default: 1 },
  maxZoom: { type: Number, default: 4 },
  minZoom: { type: Number, default: 0.1 },
});

const emit = defineEmits(["zoomUpdate", "canvasdrop"]);

// const canvas = useCanvas({
//   origin: { x: 0, y: 0 },
//   scale: props.zoom,
// })

const canvas = reactive({
  origin: { x: 0, y: 0 },
  scale: props.zoom,
});

const canvasRef = ref();
const innerRef = ref();
const shapeRef = ref();
let mousePos = null;

// useCanvas({ shapeRef, canvas });

watch(
  () => props.zoom,
  (value, origin) => {
    if (value === canvas.scale) {
      return;
    }

    const target = Math.min(props.maxZoom, Math.max(props.minZoom, origin));

    if (value > props.maxZoom || value < props.minZoom) {
      emit("zoomUpdate", target);
      return;
    }

    canvas.scale = value;

    handleScale(
      canvas.origin.x,
      canvas.origin.y,
      target,
      mousePos ? mousePos.x : canvas.origin.x,
      mousePos ? mousePos.y : canvas.origin.y,
      canvas.scale,
    );
  },
);

const onCanvasMousedown = (event) => {
  event.preventDefault();

  if (event.button !== 0) {
    return;
  }

  // 真实起始位置
  const start = { x: event.clientX, y: event.clientY };
  const origin = { x: canvas.origin.x, y: canvas.origin.y };

  const move = (e) => {
    const current = { x: e.clientX, y: e.clientY };
    const offset = { x: current.x - start.x, y: current.y - start.y };
    const final = { x: origin.x + offset.x, y: origin.y + offset.y };

    handleMove(final.x, final.y);
  };

  const up = () => {
    document.removeEventListener("mousemove", move);
    document.removeEventListener("mouseup", up);
  };

  document.addEventListener("mousemove", move);
  document.addEventListener("mouseup", up);
};

const onCanvasMousemove = (event) => {
  const bound = unref(canvasRef).getBoundingClientRect();
  const pos = { x: bound.width / 2, y: bound.height / 2 };

  const e = event || window.event;
  if (e.pageX || e.pageY) {
    pos.x = e.pageX;
    pos.y = e.pageY;
  } else if (e.clientX || e.clientY) {
    pos.x = e.clientX + document.documentElement.scrollLeft + document.body.scrollLeft;
    pos.y = e.clientY + document.documentElement.scrollTop + document.body.scrollTop;
  }

  if (pos.x >= bound.left && pos.x <= bound.right && pos.y >= bound.top && pos.y <= bound.bottom) {
    mousePos = {
      x: pos.x - bound.left,
      y: pos.y - bound.top,
    };
  } else {
    mousePos = null;
  }
};

const getBoundOrigin = () => {
  const bound = unref(canvasRef).getBoundingClientRect();
  return { left: bound.left, top: bound.top, x: bound.width / 2, y: bound.height / 2 };
};

const handleMove = (x, y) => {
  canvas.origin.x = x;
  canvas.origin.y = y;

  unref(shapeRef).style.transform = unref(
    innerRef,
  ).style.transform = `translate(${canvas.origin.x}px, ${canvas.origin.y}px) scale(${canvas.scale}) translateZ(0)`;
};

const handleScale = (startX, startY, startS, centerX, centerY, endS) => {
  // 图片在缩放后移动量
  const dx = (1 - endS / startS) * (centerX - startX);
  const dy = (1 - endS / startS) * (centerY - startY);
  // 得到缩放后图片偏移点
  canvas.origin.x += dx;
  canvas.origin.y += dy;

  unref(shapeRef).style.transform = unref(
    innerRef,
  ).style.transform = `translate(${canvas.origin.x}px, ${canvas.origin.y}px) scale(${canvas.scale}) translateZ(0)`;
};

const onCanvasDrop = (event) => {
  const bound = getBoundOrigin();
  const posX = event.clientX - bound.left;
  const posY = event.clientY - bound.top;

  emit("canvasdrop", {
    event,
    x: (posX - canvas.origin.x) / canvas.scale,
    y: (posY - canvas.origin.y) / canvas.scale,
  });
};

onMounted(() => {
  const bound = getBoundOrigin();
  handleScale(bound.x, bound.y, canvas.scale, bound.x, bound.y, canvas.scale);
  handleMove(bound.x, bound.y);
});
</script>

<template>
  <div
    ref="canvasRef"
    class="absolute w-full h-full"
    @mousedown="onCanvasMousedown"
    @mouseover="onCanvasMousemove"
    @mousemove="onCanvasMousemove"
    @dragover="(e) => e.preventDefault()"
    @drop="onCanvasDrop"
  >
    <div ref="innerRef" class="absolute top-0 left-0 z-0 w-0 h-0 overflow-visible canvas">
      <slot />
    </div>
    <div
      ref="shapeRef"
      class="absolute top-0 left-0 z-10 w-0 h-0 overflow-visible canvas shapes"
    ></div>
  </div>
</template>

<style scope>
.canvas {
  transform-origin: 0 0;
}

.shapes {
  border-top: 1px solid blue; /* 原点 */
  border-left: 1px solid blue; /* 原点 */
}
</style>
