<script lang="ts" setup>
import { onMounted, reactive } from "vue-demi";
import { JRender, useRootRender } from "@jrender/core";
import yaml from "js-yaml";

const configs = reactive({
  model: { text: "xxxxxxxaaaa", arr: [{ value: "xxx" }] },
  listeners: [],
  fields: [],
});

const onSetup = ({ onBeforeRender, onRender }: any) => {
  // 没意义，受vue2机制影响
  // 根级元素的代理值如果不是一个对象则没法直接赋给另一个属性
  onBeforeRender((field: any) => {
    field.options ||= {};

    if (field.domProps) {
      field.options.domProps = field.domProps;
    }

    if (field.props) {
      field.options.props = field.props;
    }

    if (field.on) {
      field.options.on = field.on;
    }

    if (field.nativeOn) {
      field.options.nativeOn = field.nativeOn;
    }

    if (field.class) {
      field.options.class = field.class;
    }

    if (field.style) {
      field.options.style = field.style;
    }

    if (field.slot) {
      field.options.slot = field.slot;
    }

    return field;
  });

  onRender((field: any) => {
    if (field?.options?.condition === false || field?.options?.condition === null) {
      return null;
    }
    return field;
  });
};

useRootRender(({ onBeforeRender }: any) => {
  onBeforeRender((field: any) => {
    if (!field.formItem) {
      return field;
    }

    const options = field.formItem;

    delete field.formItem;

    return { component: "el-form-item", options, children: [field] };
  });

  onBeforeRender((field: any) => {
    if (field.component !== "el-select" || !field.items) {
      return field;
    }

    const items = field.items;

    delete field.items;

    field.children = items.map((item: any) => ({
      component: "el-option",
      options: { props: { label: item.value, value: item.value } },
    }));

    return field;
  });
});

onMounted(async () => {
  const result = await fetch("data/simple.yaml");

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
