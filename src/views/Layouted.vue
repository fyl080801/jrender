<script lang="ts" setup>
import { onMounted, reactive, ref, provide } from "vue";
import { JRender, uuid } from "@jrender-legacy/core";
import request from "../utils/request";
import yaml from "js-yaml";
import { Container, Layout, designerToken } from "../components";

const configs = reactive<any>({
  model: {},
  datasource: {},
  listeners: [],
  fields: [],
});

const selected = ref(null);

const onSetup = ({ onBeforeBind, addComponent }) => {
  const state = reactive({
    selected: null,
  });

  provide(designerToken, { state });

  const containers = ["div"];

  addComponent(Container);
  addComponent(Layout);

  onBeforeBind(({ props }) => {
    props.field.id = props.field.id || uuid(10);

    return (field, next) => {
      next(field);
    };
  });

  onBeforeBind(() => (field, next) => {
    if (
      field.component === Container.name ||
      field.component === Layout.name ||
      field.layouted === true
    ) {
      return next(field);
    }

    field.layouted = true;

    next({
      component: Layout.name,
      props: { ...field.layout, id: field.id },
      on: {
        select: () => {
          state.selected = state.selected === field.id ? null : field.id;
        },
      },
      children: [field],
    });
  })
    .name("layout")
    .depend("container");

  onBeforeBind(() => (field, next) => {
    if (
      field.component === Container.name ||
      field.component === Layout.name ||
      field.containered === true ||
      !containers.includes(field.component)
    ) {
      return next(field);
    }

    const children = field.children;

    field.children = [{ component: Container.name, props: field.container, children }];

    field.containered = true;

    next(field);
  }).name("container");
};

onMounted(async () => {
  const result = await request({ url: "/data/layout.yaml" });

  const data: any = yaml.load(result.data);

  configs.datasource = data.datasource || {};
  configs.listeners = data.listeners || [];
  configs.fields = {
    type: Container.name,
    children: data.fields || [],
  };
});
</script>

<template>
  <div class="absolute w-full h-full">
    <div class="absolute w-0 h-0 transform left-1/2 top-1/2 -translate-1/2">
      <JRender
        v-model="configs.model"
        :fields="configs.fields"
        :listeners="configs.listeners"
        :data-source="configs.datasource"
        @setup="onSetup"
      />
    </div>
  </div>
</template>
