<script lang="ts" setup>
import { onMounted, reactive } from "vue-demi";
import { JRender, useRootRender } from "@jrender-legacy/core";
import { ElementExtends } from "../components";
import request from "@/utils/request";
import yaml from "js-yaml";

useRootRender(ElementExtends);

const configs = reactive({
  model: { text: "dd" },
  datasource: {},
  listeners: [],
  fields: [],
});

const onSetup = ({ onBind }) => {
  onBind(() => (field, next) => {
    if (field.component !== "template" || !field.url) {
      return next(field);
    }

    request({ url: field.url }).then(async (response) => {
      const result: any = yaml.load(response.data);
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
  const result = await request({
    url: "/data/nest.yaml",
  });

  const data: any = yaml.load(result.data);

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
