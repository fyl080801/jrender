<script lang="ts" setup>
// const { proxy } = getCurrentInstance();
const emit = defineEmits(["select"]);

const containerState: any = inject(layoutToken);

const designerState: any = inject(designerToken);

const props = defineProps({
  id: String,
  diaplay: { type: String, default: "inline-block" },
  x: { type: Number, default: 0 },
  y: { type: Number, default: 0 },
  flex: { type: Number, default: 1 },
});

const styles = computed<any>(() => {
  return {
    position: containerState?.props?.type === "abs" ? "absolute" : undefined,
    display: props.diaplay,
    transform:
      containerState?.props?.type === "abs" ? `translate(${props.x}px, ${props.y}px)` : undefined,
    top: containerState?.props?.type === "abs" ? 0 : undefined,
    left: containerState?.props?.type === "abs" ? 0 : undefined,
    flex: containerState?.props.flex ? props.flex : undefined,
  };
});

const layoutRef = ref();

const onSelect = () => {
  emit("select");
};

onMounted(() => {
  // unref(layoutRef).addEventListener("mousedown", () => {});
});
</script>

<script lang="ts">
import { defineComponent, computed, inject, ref, onMounted, unref } from "vue";
import { layoutToken, designerToken } from "./mixins";

export default defineComponent({
  name: "layout",
});
</script>

<template>
  <div ref="layoutRef" class="r-layout" :style="styles">
    <slot />
    <div class="r-layout-face" @click="onSelect"></div>
    <div
      v-if="designerState.state.selected === id"
      ref="layoutRef"
      class="r-layout-movment border border-solid border-green-500"
    ></div>
  </div>
</template>

<style scoped>
.r-layout {
  position: relative;
}

.r-layout-face {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

.r-layout-movment {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
</style>
