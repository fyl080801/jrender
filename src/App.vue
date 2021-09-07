<script lang="ts" setup>
import { reactive } from "@vue/composition-api";
import { JRender } from "@jrender/core";

const configs = reactive({
  fields: [
    {
      component: "div",
      children: [{ component: "span", options: { domProps: { innerText: "xxx" } } }],
    },
  ],
});
</script>

<template>
  <div>
    <JRender :fields="configs.fields" />
  </div>
</template>
