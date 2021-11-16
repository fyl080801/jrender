<script lang="ts" setup>
import { onMounted, reactive, provide, inject, set } from "@vue/composition-api";
import { JRender, toPath } from "@jrender/core";
import yaml from "js-yaml";

const configs = reactive({
  model: { text: "xxxxxxxaaaa", arr: [{ value: "xxx" }] },
  datasource: {},
  listeners: [],
  fields: [],
});

const onSetup = ({ onRender, onBeforeRender }) => {
  const formToken = Symbol("form");

  onBeforeRender(() => {
    return (field, next) => {
      const { inform } = inject(formToken, { inform: false });

      if (!inform || !field?.formItem) {
        return next(field);
      }

      const props = field.formItem;
      delete field.formItem;

      next({ component: "el-form-item", condition: field.condition, props, children: [field] });
    };
  });

  onBeforeRender(() => {
    return (field, next) => {
      if (field?.component === "el-form") {
        provide(formToken, { inform: true });
      }

      next(field);
    };
  }).depend("typeToComponent");

  onRender(() => {
    return (field, next) => {
      if (typeof field?.model === "string") {
        const source = toPath(field.model);
        const arr = field.model.replace(source[0], "");

        if (!field.props) {
          set(field, "props", {});
        }

        field.props.value = `$:GET(${source[0]}, '${arr}', ${field.defaultValue})`;

        if (!field.events) {
          set(field, "events", {});
        }

        field.events.input = `$:(e)=>SET(${source[0]}, '${arr}', e)`;
      }

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
