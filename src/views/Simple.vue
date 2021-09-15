<script lang="ts" setup>
import { onMounted, reactive } from "@vue/composition-api";
import { JRender } from "@jrender/core";
import yaml from "js-yaml";

const configs = reactive({
  model: { text: "xxxxxxxaaaa", arr: [{ value: "xxx" }] },
  listeners: [],
  fields: [],
});

const onSetup = ({ onBeforeRender, onRender }) => {
  let cachedField = null;

  onBeforeRender((field, next) => {
    if (!field.formItem) {
      next(field);
      return;
    }

    const options = field.formItem;

    delete field.formItem;

    next({ component: "el-form-item", options, children: [field] });
  });

  onBeforeRender((field, next) => {
    if (field.component !== "el-select" || !field.items) {
      next(field);
      return;
    }

    const items = field.items;

    delete field.items;

    field.children = items.map((item: any) => ({
      component: "el-option",
      options: { props: { label: item.value, value: item.value } },
    }));

    next(field);
  });

  onBeforeRender((field, next) => {
    if (field.options?.rel !== true) {
      return next(field);
    }

    cachedField = field;

    next({ component: "p", options: { domProps: { innerText: "Loading (6)" } } });

    let count = 5;

    const timer = setInterval(() => {
      if (count > 0) {
        next({ component: "p", options: { domProps: { innerText: `Loading (${count})` } } });
        count--;
      } else {
        clearInterval(timer);
        next(cachedField);
      }
    }, 1000);
  });
};

onMounted(async () => {
  const result = await fetch("/data/simple.yaml");

  const data: any = yaml.load(await result.text());

  configs.listeners = data.listeners || [];
  configs.fields = data.fields || [];
});
</script>

<template>
  <div>
    <input v-model="configs.model.text" />
    <JRender
      v-model="configs.model"
      :fields="configs.fields"
      :listeners="configs.listeners"
      @setup="onSetup"
    >
      <div>inner scope</div>
      <template v-slot:subtitle> subtitle slot </template>
    </JRender>
    <p>{{ JSON.stringify(configs.model) }}</p>
  </div>
</template>
