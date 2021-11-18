<script lang="ts" setup>
import { onMounted, reactive } from "@vue/composition-api";
import { JRender, useRootRender } from "@jrender-legacy/core";
import { ElementExtends } from "../components";
import yaml from "js-yaml";

useRootRender(ElementExtends);

const configs = reactive({
  model: { text: "" },
  datasource: {},
  listeners: [],
  fields: [],
});

const onSetup = ({ onRender }) => {
  onRender(() => (field, next) => {
    if (field.component !== "template" || !field.url) {
      return next(field);
    }

    fetch(field.url).then(async (response) => {
      const result: any = yaml.load(await response.text());

      const template = {
        component: JRender,
        props: {
          fields: result.fields || [],
          dataSource: {
            props: {
              props: field.props,
            },
          },
        },
        children: field.children,
      };

      next(template);
    });

    next(field);
  });
};

onMounted(async () => {
  const result = await fetch("/data/nest.yaml");

  const data: any = yaml.load(await result.text());

  configs.datasource = data.datasource || {};
  configs.listeners = data.listeners || [];
  configs.fields = data.fields || [];
});
</script>

<template>
  <div>
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
