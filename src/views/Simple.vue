<script lang="ts" setup>
import { onMounted, reactive } from "vue";
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

const onSetup = ({ onBeforeBind }) => {
  //
  onBeforeBind(() => (field, next) => {
    if (field.timeout) {
      setTimeout(() => {
        next(field);
      }, field.timeout);
      return;
    } else {
      next(field);
    }
  });
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
  <div class="canvas">
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
