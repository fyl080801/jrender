<script lang="ts" setup>
import { JRender } from "@jrender/core";
import { reactive } from "vue-demi";

const config = reactive({
  fields: [
    {
      component: "div",
      options: { class: "base" },
      children: [{ component: "span", options: { domProps: { innerText: "xxx" } } }],
    },
  ],
});
</script>

<template>
  <div>
    <JRender :fields="config.fields" />
  </div>
</template>
