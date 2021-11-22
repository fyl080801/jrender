<script lang="ts" setup>
const containerState: any = inject(layoutToken);

const props = defineProps({
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
</script>

<script lang="ts">
import { defineComponent, computed, inject } from "@vue/composition-api";
import { layoutToken } from "./mixins";

export default defineComponent({
  name: "layout",
});
</script>

<template>
  <div class="r-layout" :style="styles">
    <slot />
  </div>
</template>
