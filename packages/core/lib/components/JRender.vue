<script lang="ts" setup>
import { Fragment } from "vue-fragment";
import { computed, isReactive, reactive, watch } from "vue-demi";
import JNode from "./JNode";
import { useJRender } from "../utils/mixins";
import { isFunction } from "../utils/helper";

const props = defineProps({
  fields: { type: [Array, Object], default: () => [] },
  value: { type: Object, default: () => ({}) },
});

const emit = defineEmits(["setup", "input"]);

const { context, beforeRenderHandlers } = useJRender({
  context: { model: isReactive(props.value) ? props.value : reactive(props.value) },
  beforeRenderHandlers: [],
}) as Record<string, unknown>;

const isArrayRoot = computed(() => {
  return Array.isArray(props.fields);
});

watch(
  () => (context as Record<string, unknown>).model,
  (value) => {
    emit("input", value);
  },
);

emit("setup", {
  // setComponent: (name, type) => {
  //   components.set(name, type);
  // },
  onBeforeRender: (handler: (field: unknown) => unknown) => {
    if (isFunction(handler)) {
      (beforeRenderHandlers as unknown[]).push(handler);
    }
  },
  // setFunctional: (name, invoke) => {
  //   if (isFunction(invoke)) {
  //     functionals[name] = invoke;
  //   }
  // },
  // addProxy: (proxy) => {
  //   if (isFunction(proxy)) {
  //     proxyList.push(proxy);
  //   }
  // },
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
