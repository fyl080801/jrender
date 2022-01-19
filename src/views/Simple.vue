<script lang="ts" setup>
import { onMounted, reactive } from "vue-demi";
import { JRender, useRootRender } from "@jrender-legacy/core";
import { ElementExtends } from "../components";
import yaml from "js-yaml";
import request from "@/utils/request";

useRootRender(ElementExtends);

const configs = reactive({
  model: { text: "xxxxxxxaaaa", arr: [{ value: "xxx" }] },
  datasource: {},
  listeners: [],
  fields: [],
});

const onSetup = () => {
  //
};

onMounted(async () => {
  const result = await request({ url: "/data/simple.yaml" });

  const data: any = yaml.load(result.data);

  configs.datasource = data.datasource || {};
  configs.listeners = data.listeners || [];
  configs.fields = data.fields || [];
});
</script>

<template>
  <div>
    <JRender
      v-model="configs.model"
      :fields="configs.fields"
      :listeners="configs.listeners"
      :data-source="configs.datasource"
      @setup="onSetup"
    />
    <!-- <p>{{ JSON.stringify(configs.model) }}</p> -->
  </div>
</template>
