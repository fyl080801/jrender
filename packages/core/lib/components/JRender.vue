<script lang="ts" setup>
import { Fragment } from "vue-fragment";
import { computed, isReactive, reactive, watch, useSlots, ref, onBeforeUnmount } from "vue-demi";
import JNode from "./JNode";
import { useJRender, useRootRender } from "../utils/mixins";
import { globalServiceProvider, mergeServices, createServiceProvider } from "../utils/service";
import { assignObject, deepClone, isArray, isFunction } from "../utils/helper";
import { injectProxy } from "../utils/proxy";

const props = defineProps({
  fields: { type: [Array, Object], default: () => [] },
  value: { type: Object, default: () => ({}) },
  listeners: { type: Array, default: () => [] },
});

const emit = defineEmits(["setup", "input"]);

const provider = createServiceProvider();
const rootServices = useRootRender();

const isArrayRoot = computed(() => {
  return Array.isArray(props.fields);
});

emit("setup", provider.getSetting());

const context = reactive({ model: isReactive(props.value) ? props.value : reactive(props.value) });

const mergedServices: any = mergeServices(
  globalServiceProvider.getServices(),
  rootServices,
  provider.getServices(),
);

const proxy = (mergedServices as any).proxy.map((p: any) =>
  p({ functional: (mergedServices as any).functional }),
);

const injector = injectProxy({
  context: assignObject({}, context as Record<string, unknown>, { scope: {} }),
  proxy,
});

useJRender({
  context: context,
  slots: useSlots(),
  fields: props.fields,
  mergedServices,
}) as Record<string, unknown>;

watch(
  () => (context as Record<string, unknown>).model,
  (value) => {
    emit("input", value);
  },
);

//#region listeners 监听
const watchs = ref([] as any[]);

watch(
  () => props.listeners,
  (value) => {
    watchs.value.forEach((watcher) => watcher());

    if (!value || !isArray(value)) {
      return;
    }

    watchs.value = value.map((item: any) => {
      const injected: any = injector(deepClone(item));

      const watcher = isFunction(injected.watch) ? injected.watch : () => injected.watch;

      return watch(
        watcher,
        () => {
          injected.actions.forEach((act: any) => {
            if (act.condition === undefined || !!act.condition) {
              if (act.timeout) {
                setTimeout(() => act.handler(), act.timeout);
              } else {
                act.handler();
              }
            }
          });
        },
        {
          deep: injected.deep,
          immediate: injected.immediate,
        },
      );
    });
  },
  { deep: false, immediate: true },
);

onBeforeUnmount(() => {
  watchs.value.forEach((watcher) => watcher());
});
//#endregion
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
