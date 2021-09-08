<script lang="ts" setup>
import { Fragment } from "vue-fragment";
import { computed, isReactive, reactive, watch, useSlots } from "vue-demi";
import JNode from "./JNode";
import JRepeat from "./JRepeat";
import { useJRender } from "../utils/mixins";
import { isFunction } from "../utils/helper";

const props = defineProps({
  fields: { type: [Array, Object], default: () => [] },
  value: { type: Object, default: () => ({}) },
});

const emit = defineEmits(["setup", "input"]);

const { context, beforeRenderHandlers, components, functional, proxy } = useJRender({
  context: reactive({ model: isReactive(props.value) ? props.value : reactive(props.value) }),
  components: {
    repeat: JRepeat,
  },
  functional: {},
  beforeRenderHandlers: [],
  proxy: [],
  slots: useSlots(),
  fields: props.fields,
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
  addComponent: (name: string, type: unknown) => {
    (components as Record<string, unknown>)[name] = type;
  },
  addFunction: (name: string, fx: unknown) => {
    if (isFunction(fx)) {
      (functional as Record<string, unknown>)[name] = fx;
    }
  },
  onBeforeRender: (handler: (field: unknown) => unknown) => {
    if (isFunction(handler)) {
      (beforeRenderHandlers as unknown[]).push(handler);
    }
  },
  addProxy: (handler: unknown) => {
    if (isFunction(handler)) {
      (proxy as unknown[]).push(handler);
    }
  },
});
</script>

<template>
  <Fragment>
    <template v-if="isArrayRoot">
      <JNode
        v-for="(field, index) in fields"
        :key="field['key'] || index"
        :field="field"
        :scope="{}"
      />
    </template>
    <template v-else>
      <JNode :field="fields" :scope="{}" />
    </template>
  </Fragment>
</template>
