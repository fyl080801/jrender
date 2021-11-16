<script lang="ts" setup>
import { onMounted, reactive, provide, inject } from "@vue/composition-api";
import { JRender } from "@jrender/core";
import yaml from "js-yaml";

const configs = reactive({
  model: { text: "xxxxxxxaaaa", arr: [{ value: "xxx" }] },
  datasource: {},
  listeners: [],
  fields: [],
});

const onSetup = ({ onBeforeRender }) => {
  const formToken = Symbol("form");

  onBeforeRender(() => {
    const { inform } = inject(formToken, { inform: false });

    return (field, next) => {
      if (!inform || !field.formItem) {
        return next(field);
      }

      const props = field.formItem;
      delete field.formItem;

      next({ component: "el-form-item", props, children: [field] });
    };
  });

  onBeforeRender(({ props }) => {
    if (props.field.component === "el-form") {
      provide(formToken, { inform: true });
    }

    return (field, next) => {
      next(field);
    };
  });
};

onMounted(async () => {
  const result = await fetch("/data/simple.yaml");

  const data: any = yaml.load(await result.text());

  configs.datasource = data.datasource || {};
  configs.listeners = data.listeners || [];
  configs.fields = data.fields || [];
});
</script>

<template>
  <div>
    <!-- <input v-model="configs.model.text" /> -->
    <JRender
      v-model="configs.model"
      :fields="configs.fields"
      :listeners="configs.listeners"
      :data-source="configs.datasource"
      @setup="onSetup"
    />
    <p>{{ JSON.stringify(configs.model) }}</p>
  </div>
</template>
