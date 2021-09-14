<script lang="ts" setup>
import { JRender } from "@jrender/core";
import { reactive, onMounted } from "vue-demi";
import yaml from "js-yaml";

const configs = reactive({ fields: [] });

const model = reactive({ data: [{ title: "xxx" }] });

onMounted(() => {
  fetch("/data/table.yaml").then(async (response) => {
    const { fields }: any = yaml.load(await response.text());
    configs.fields = fields;
  });
});
</script>

<template>
  <div>
    <JRender :fields="configs.fields" v-model="model" />
  </div>
</template>
