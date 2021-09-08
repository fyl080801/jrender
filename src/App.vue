<script lang="ts" setup>
import { reactive } from "@vue/composition-api";
import { JRender } from "@jrender/core";

const configs = reactive({
  model: { text: "xxxxxxxaaaa", obj: {}, sel: null, arr: [{ value: "xxx" }] },
  fields: [
    {
      component: "el-form",
      options: { props: { labelPosition: "top" } },
      children: [
        {
          component: "el-input",
          formItem: { label: "$:'input:' + GET(model, 'obj.text', '')" },
          options: {
            props: { value: "$:model.obj.text" },
            attrs: { placeholder: "input value" },
            on: {
              input: "$:(e)=>UPDATE(model, 'obj.text', e)",
              // input: "@model.obj.text:arguments[0]",
            },
          },
        },
        {
          component: "el-select",
          formItem: { label: "select" },
          options: {
            props: { value: "$:model.sel" },
            on: { input: "$:(e)=>UPDATE(model, 'sel', e)" },
          },
          items: "$:model.arr",
        },
        {
          component: "div",
          children: [
            { component: "p", options: { domProps: { innerText: "xxx" } } },
            { component: "p", options: { domProps: { innerText: "$:model.text" } } },
            // { component: "p", options: { domProps: { innerText: "$:model.obj.text" } } },
          ],
        },
        {
          component: "el-button",
          options: {
            domProps: { innerText: "添加" },
            on: { click: "$:()=>model.arr.push({ value: 'vvv' + model.arr.length })" },
          },
        },
      ],
    },
  ],
});

const onSetup = ({ onBeforeRender }: any) => {
  onBeforeRender((field: any) => {
    if (!field.formItem) {
      return field;
    }

    const props = field.formItem;

    delete field.formItem;

    return { component: "el-form-item", options: { props }, children: [field] };
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
</script>

<template>
  <div>
    <input v-model="configs.model.text" />
    <JRender :fields="configs.fields" v-model="configs.model" @setup="onSetup" />
    <p>{{ JSON.stringify(configs.model) }}</p>
  </div>
</template>
