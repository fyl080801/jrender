<script lang="ts" setup>
import { reactive } from "vue-demi";
import { JRender, useRootRender } from "@jrender/core";

const configs = reactive({
  model: { text: "xxxxxxxaaaa", obj: {}, sel: null, arr: [{ value: "xxx" }], checked: false },
  fields: [
    {
      component: "el-form",
      options: { props: { labelPosition: "top" } },
      children: [
        {
          component: "el-input",
          formItem: { props: { label: "$:'input:' + GET(model, 'obj.text', '')" } },
          options: {
            props: { value: "$:model.obj.text" },
            attrs: { placeholder: "input value" },
            on: {
              input: "$:(e)=>UPDATE(model, 'obj.text', e)",
              // input: "@model.obj.text:arguments[0]",
            },
          },
          children: [
            { component: "span", options: { slot: "append", domProps: { innerText: "aaaa" } } },
          ],
        },
        {
          component: "el-checkbox",
          formItem: { props: { label: "checked" } },
          options: {
            props: { value: "$:model.checked" },
            on: { input: "$:(e)=>UPDATE(model, 'checked', e)" },
          },
        },
        {
          component: "el-select",
          formItem: {
            condition: "$:model.checked",
            props: { label: "select" },
          },
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
            { component: "p", domProps: { innerText: "$:model.text" } },
            { component: "h1", children: [{ component: "slot" }] },
            { component: "h2", children: [{ component: "slot", name: "subtitle" }] },
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

const onSetup = ({ onBeforeRender, onRender }: any) => {
  // 没意义，受vue2机制影响
  // 根级元素的代理值如果不是一个对象则没法直接赋给另一个属性
  onBeforeRender((field: any) => {
    if (["span", "p"].indexOf(field.component as string) >= 0 && field.domProps) {
      field.options ||= {};
      field.options.domProps = field.domProps;
    }

    return field;
  });

  onRender((field: any) => {
    if (field?.options?.condition === false) {
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
</script>

<template>
  <div>
    <input v-model="configs.model.text" />
    <JRender :fields="configs.fields" v-model="configs.model" @setup="onSetup">
      <div>inner scope</div>
      <template v-slot:subtitle> subtitle slot </template>
    </JRender>
    <p>{{ JSON.stringify(configs.model) }}</p>
  </div>
</template>
