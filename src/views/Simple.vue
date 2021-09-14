<script lang="ts" setup>
import { onMounted, reactive } from "@vue/composition-api";
import { JRender } from "@jrender/core";
import yaml from "js-yaml";

const configs = reactive({
  model: { text: "xxxxxxxaaaa", arr: [{ value: "xxx" }] },
  listeners: [],
  fields: [],
});

const onSetup = ({ onBeforeRender }: any) => {
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
