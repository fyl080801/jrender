<script lang="ts" setup>
import { Fragment } from "vue-fragment";
import { computed } from "vue-demi";
import JNode from "./JNode";

const props = defineProps({
  fields: { type: [Array, Object], default: () => [] },
  value: { type: Object, default: () => ({}) },
});

const isArrayRoot = computed(() => {
  return Array.isArray(props.fields);
});
</script>

<template>
  <Fragment>
    <template v-if="isArrayRoot">
      <JNode v-for="(field, index) in fields" :key="field['key'] || index" :field="field" />
    </template>
    <template v-else>
      <JNode :field="fields" />
    </template>
  </Fragment>
</template>
