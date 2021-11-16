<script lang="ts" setup>
import { onMounted, reactive, defineComponent, h, markRaw } from "@vue/composition-api";
import { JRender, JNode, assignObject, deepGet } from "@jrender/core";
import yaml from "js-yaml";

const configs = reactive({
  model: { text: "xxxxxxxaaaa", arr: [{ value: "xxx" }] },
  datasource: {},
  listeners: [],
  fields: [],
});

const onSetup = ({ onRender, onBeforeRender, addComponent }) => {
  onBeforeRender(() => (field, next) => {
    if (!field.formItem) {
      return next(field);
    }
    const props = field.formItem;
    delete field.formItem;
    next({ component: "el-form-item", props, children: [field] });
  });

  // onBeforeRender(() => (field, next) => {
  //   if (field.component !== "el-select" || !field.items) {
  //     return next(field);
  //   }
  //   const items = field.items;
  //   delete field.items;
  //   field.children = items.map((item: any) => ({
  //     component: "el-option",
  //     options: { props: { label: item.value, value: item.value } },
  //   }));
  //   next(field);
  // });
  // onBeforeRender(() => (field, next) => {
  //   if (field.options?.rel !== true) {
  //     return next(field);
  //   }
  //   next({ component: "p", options: { domProps: { innerText: "Loading (6)" } } });
  //   let count = 5;
  //   const timer = setInterval(() => {
  //     if (count > 0) {
  //       next({ component: "p", options: { domProps: { innerText: `Loading (${count})` } } });
  //       count--;
  //     } else {
  //       clearInterval(timer);
  //       next(field);
  //     }
  //   }, 1000);
  // });
};

onMounted(async () => {
  const result = await fetch("/data/simple.yaml");

  const data: any = yaml.load(await result.text());

  configs.datasource = data.datasource || {};
  configs.listeners = data.listeners || [];
  configs.fields = data.fields || [];
});
</script>

<template>
  <div>
    <!-- <input v-model="configs.model.text" /> -->
    <JRender
      v-model="configs.model"
      :fields="configs.fields"
      :listeners="configs.listeners"
      :data-source="configs.datasource"
      @setup="onSetup"
    />
    <p>{{ JSON.stringify(configs.model) }}</p>
  </div>
</template>
