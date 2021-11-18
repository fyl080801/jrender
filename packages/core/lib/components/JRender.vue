<script lang="ts">
import { watch, computed, defineComponent, reactive, set } from "@vue/composition-api";
import { isArray, isFunction } from "../utils/helper";
import { useJRender, useListener, useScope, useServices } from "../utils/mixins";
import { injectProxy } from "../utils/proxy";
import JNode from "./JNode.vue";

export default defineComponent({
  name: "JRender",
  components: {
    JNode,
  },
  props: {
    value: { type: Object, default: () => ({}) },
    fields: { type: [Array, Object], default: () => [] },
    listeners: { type: Array, default: () => [] },
    dataSource: { type: Object, default: () => ({}) },
  },
  setup(props, ctx) {
    const services = useServices({
      emit: ctx.emit,
    });

    const context = reactive({
      model: props.value,
      refs: {},
    });

    const isArrayRoot = computed(() => {
      return isArray(props.fields);
    });

    const injector = injectProxy({
      context,
      scope: {},
      proxy: services.proxy.map((p) => p({ functional: services.functional })),
    });

    useJRender({
      services,
      props,
      slots: ctx.slots,
    });

    useScope({});

    // dataSource
    watch(
      () => props.dataSource,
      (value, origin) => {
        Object.keys(origin || {}).forEach((key) => {
          delete context[key];
        });

        Object.keys(value || {}).forEach((key) => {
          const info = value[key];
          const provider = services.dataSource[info.type || "default"];

          if (["model", "scope", "arguments", "refs"].indexOf(key) < 0 && isFunction(provider)) {
            set(
              context,
              key,
              provider(() => injector(info.props)),
            );
          }
        });
      },
      { immediate: true },
    );

    watch(
      () => context.model,
      (value) => {
        ctx.emit("input", value);
      },
      { deep: false },
    );

    useListener(props, { injector });

    return {
      isArrayRoot,
      context,
    };
  },
});
</script>

<template>
  <div v-if="isArrayRoot">
    <JNode
      v-for="(field, index) in fields"
      :key="field.key || index"
      :field="field"
      :context="context"
    />
  </div>
  <JNode v-else :field="fields" :context="context" />
</template>
