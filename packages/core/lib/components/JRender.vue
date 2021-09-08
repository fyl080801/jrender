<script lang="ts" setup>
import { Fragment } from "vue-fragment";
import { computed, isReactive, reactive, watch, set } from "vue-demi";
import JNode from "./JNode";
import JRepeat from "./JRepeat";
import { useJRender } from "../utils/mixins";
import {
  deepGet,
  hasOwnProperty,
  isArray,
  isFunction,
  isNumberLike,
  toPath,
} from "../utils/helper";

const props = defineProps({
  fields: { type: [Array, Object], default: () => [] },
  value: { type: Object, default: () => ({}) },
});

const emit = defineEmits(["setup", "input"]);

const vDeepSet = (target: Record<string, unknown>, path: string, value: unknown) => {
  const fields = isArray(path) ? path : toPath(path);
  const prop = (fields as any).shift();

  if (!fields.length) {
    return set(target, prop, value);
  }

  if (!hasOwnProperty(target, prop) || target[prop] === undefined) {
    const objVal = fields.length >= 1 && isNumberLike(fields[0]) ? [] : {};
    set(target, prop, objVal);
  }

  vDeepSet((target as any)[prop], fields as any, value);
};

const { context, beforeRenderHandlers, components, functional } = useJRender({
  context: { model: isReactive(props.value) ? props.value : reactive(props.value) },
  components: new Map([["repeat", JRepeat]]),
  functional: {
    UPDATE: (target: Record<string, unknown>, path: string, value: unknown) => {
      vDeepSet(target, path, value);
    },
    GET: (target: Record<string, unknown>, path: string, def: unknown) => {
      return deepGet(target, path) || def;
    },
  },
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
  addComponent: (name: string, type: unknown) => {
    (components as Map<string, unknown>).set(name, type);
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
