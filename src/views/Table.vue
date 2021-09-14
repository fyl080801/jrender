<script lang="ts" setup>
import { JRender } from "@jrender/core";
import { reactive, onMounted } from "@vue/composition-api";
import yaml from "js-yaml";

const configs = reactive({ fields: [], listeners: [], datasource: {} });

const model = reactive({ data: [{ title: "xxx" }] });

const onSetup = ({ addDataSource }: any) => {
  addDataSource("fetch", (opt: any) => {
    const instance = {
      fetch: async () => {
        const options: any = opt();
        try {
          instance.loading = true;

          const response: any = await fetch(options.url, options.props);
          const result = await response[options.type || "json"]();
          setTimeout(() => {
            instance.data = result;
            instance.loading = false;
          }, options.fakeTimeout || 0);
        } catch {
          instance.data = options.defaultData || [];
          instance.loading = false;
        }
      },
      loading: false,
      data: opt()?.defaultData || [],
    };

    return instance;
  });
};

onMounted(() => {
  fetch("/data/table.yaml").then(async (response) => {
    const { fields, listeners, datasource }: any = yaml.load(await response.text());
    configs.fields = fields;
    configs.listeners = listeners;
    configs.datasource = datasource;
  });
});
</script>

<template>
  <div>
    <JRender
      :fields="configs.fields"
      :listeners="configs.listeners"
      :data-source="configs.datasource"
      v-model="model"
      @setup="onSetup"
    />
  </div>
</template>
