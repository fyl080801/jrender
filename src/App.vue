<script lang="ts" setup>
import { reactive } from "@vue/composition-api";
import { JRender } from "@jrender/core";

const configs = reactive({
  model: { text: "xxxxxxxaaaa", obj: {} },
  fields: [
    {
      component: "el-form",
      children: [
        {
          component: "el-input",
          formItem: { label: "$:model.obj.text" },
          options: {
            props: { value: "$:model.obj.text" },
            attrs: { placeholder: "input value" },
            on: { input: "$:(e)=>UPDATE(model, 'obj.text', e)" },
          },
        },
        // {
        //   component: "el-select",
        //   formItem: { label: "select" },
        //   options: {
        //     props: { value: "$:model.sel" },
        //     on: { input: "$:(e)=>UPDATE(model, 'sel', e)" },
        //   },
        //   children: [
        //     {
        //       component: "repeat",
        //       options: {
        //         props: {
        //           data: [{ value: "xxx" }],
        //           field: {
        //             component: "el-option",
        //             options: { props: { value: "$:scope.value", label: "$:scope.value" } },
        //           },
        //         },
        //       },
        //     },
        //   ],
        // },
        // {
        //   component: "input",
        //   options: {
        //     domProps: { placeholder: "input value", value: "$:model.obj.text" },
        //     on: { input: "$:(e)=>UPDATE(model, 'obj.text', e.target.value)" },
        //   },
        // },
        {
          component: "div",
          children: [
            { component: "p", options: { domProps: { innerText: "xxx" } } },
            { component: "p", options: { domProps: { innerText: "$:model.text" } } },
            // { component: "p", options: { domProps: { innerText: "$:model.obj.text" } } },
          ],
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
};
</script>

<template>
  <div>
    <input v-model="configs.model.text" class="" />
    <JRender :fields="configs.fields" v-model="configs.model" @setup="onSetup" />
  </div>
</template>
