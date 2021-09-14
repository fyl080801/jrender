<script lang="ts" setup>
import Toolbox from "./Toolbox.vue";
import Document from "./Document.vue";
import Preview from "./Preview.vue";
import Attributes from "./Attributes.vue";
import { useDesignerStore } from "../store";
import { watch } from "@vue/composition-api";

const props = defineProps({
  config: { type: Object, required: true },
});

const designerStore = useDesignerStore();

watch(
  () => props.config,
  (value) => {
    designerStore.setConfig(value);
  },
  { immediate: true },
);
</script>

<template>
  <div class="relative">
    <div class="flex w-full h-full">
      <Toolbox></Toolbox>
      <Document></Document>
      <Preview></Preview>
      <Attributes></Attributes>
    </div>
  </div>
</template>
