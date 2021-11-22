<script lang="ts" setup>
import { onMounted, reactive } from "@vue/composition-api";
import { JRender } from "@jrender-legacy/core";
import yaml from "js-yaml";
import { Container, Layout } from "../components";

const configs = reactive<any>({
  model: {},
  datasource: {},
  listeners: [],
  fields: [],
});

const onSetup = ({ onBeforeRender, addComponent }) => {
  const containers = ["div"];

  addComponent(Container);
  addComponent(Layout);

  onBeforeRender(() => (field, next) => {
    if (
      field.component === Container.name ||
      field.component === Layout.name ||
      field.layouted === true
    ) {
      return next(field);
    }

    field.layouted = true;

    next({ component: Layout.name, props: field.layout, children: [field] });
  })
    .name("layout")
    .depend("container");

  onBeforeRender(() => (field, next) => {
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
  const result = await fetch("/data/layout.yaml");

  const data: any = yaml.load(await result.text());

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
