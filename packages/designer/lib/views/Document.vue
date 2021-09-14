<script lang="ts" setup>
import { DocTree } from "../components";
import { useDesignerStore } from "../store";

const designerStore = useDesignerStore();
</script>

<template>
  <div class="w-1/6 border-r border-gray-200 border-solid">
    <DocTree :data="designerStore.state.config.fields" />
  </div>
</template>
