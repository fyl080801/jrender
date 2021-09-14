<script lang="ts" setup>
import { JDesigner } from "@jrender/designer";
import { ref, onMounted } from "vue-demi";
import yaml from "js-yaml";

const config: any = ref({
  fields: [{ component: "p", options: { domProps: { innerText: "demo" } } }],
  listeners: [],
  datasource: {},
});

onMounted(() => {
  fetch("/data/designer.yaml").then(async (response) => {
    const data = yaml.load(await response.text());
    config.value = data;
  });
});
</script>

<template>
  <JDesigner class="w-full h-full" :config="config" />
</template>
