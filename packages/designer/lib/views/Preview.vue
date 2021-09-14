<script lang="ts" setup>
import Canvas from "./Canvas.vue";
import { JRender } from "@jrender/core";
import { useDesignerStore } from "../store";
import { reactive } from "@vue/composition-api";

const designerStore = useDesignerStore();
const canvasRect = reactive({ zoom: 1 });

const onSetup = () => {
  //
};

const onPreviewZoom = (event) => {
  const isZoomIn = event.deltaY > 0;
  if (isZoomIn) {
    canvasRect.zoom += 0.1;
  } else {
    canvasRect.zoom -= 0.1;
  }
};

const onZoomUpdate = (value) => {
  canvasRect.zoom = value;
};
</script>

<template>
  <div class="relative flex-1 w-full h-full overflow-hidden" @wheel="onPreviewZoom">
    <Canvas :zoom="canvasRect.zoom" @zoomUpdate="onZoomUpdate">
      <JRender :fields="designerStore.state.config.fields" @setup="onSetup" />
    </Canvas>
  </div>
</template>
