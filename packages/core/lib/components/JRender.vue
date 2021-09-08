<script lang="ts" setup>
import { Fragment } from "vue-fragment";
import { computed, isReactive, reactive, watch, useSlots } from "vue-demi";
import JNode from "./JNode";
import { useJRender } from "../utils/mixins";
import { createServiceProvider } from "../utils/service";

const props = defineProps({
  fields: { type: [Array, Object], default: () => [] },
  value: { type: Object, default: () => ({}) },
});

const emit = defineEmits(["setup", "input"]);
const provider = createServiceProvider();
const { context } = useJRender({
  context: reactive({ model: isReactive(props.value) ? props.value : reactive(props.value) }),
  // components: {
  //   repeat: JRepeat,
  // },
  // functional: {},
  // beforeRenderHandlers: [],
  // proxy: [],
  slots: useSlots(),
  fields: props.fields,
  innerServices: provider.getServices(),
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

emit("setup", provider.getSetting());
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
