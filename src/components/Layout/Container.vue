<script lang="ts" setup>
const props = defineProps({
  type: { type: String, default: "rel" },
  flex: { type: Boolean, default: false },
});

provide(layoutToken, { props });

const styles = computed<any>(() => {
  return {
    position: props.type === "abs" ? "absolute" : undefined,
    display: props.flex ? "flex" : undefined,
  };
});
</script>

<script lang="ts">
import { defineComponent, computed, provide } from "vue";
import { layoutToken } from "./mixins";

export default defineComponent({
  name: "container",
});
</script>

<template>
  <div :style="styles" class="r-container">
    <slot />
  </div>
</template>

<style scoped>
.r-container {
  width: 100% !important;
  height: 100% !important;
}

.text {
  position: relative;
}
</style>
