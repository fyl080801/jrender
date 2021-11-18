<script lang="ts">
import {
  computed,
  defineComponent,
  ref,
  markRaw,
  toRaw,
  watch,
  onMounted,
} from "@vue/composition-api";
import { isOriginTag } from "../utils/domTags";
import { assignObject } from "../utils/helper";
import { useJRender, useScope } from "../utils/mixins";
import { pipeline } from "../utils/pipeline";
import { getProxyDefine, injectProxy } from "../utils/proxy";
import JSlot from "./JSlot";

export default defineComponent({
  name: "JNode",
  props: {
    field: Object,
    scope: Object,
    temp: { type: Object, default: () => ({}) },
    context: { type: Object, required: true },
  },
  setup(props) {
    const { services, slots } = useJRender();

    const { scope } = useScope(assignObject(props.scope || {}, props.temp));

    const sharedServices = {
      context: props.context,
      scope,
      props,
      render: () => {
        render(assignObject(getProxyDefine(toRaw(props.field))));
      },
    };

    const injector = injectProxy({
      context: props.context,
      scope,
      proxy: services.proxy.map((p) => p({ functional: services.functional })),
    });

    const renderField = ref();

    const renderSlots = computed<any>(() => {
      if (!renderField.value) {
        return [];
      }

      const scoped = {};
      const named = {};

      renderField.value?.children
        ?.filter((child) => child)
        .forEach((child) => {
          if (child.scopedSlot) {
            scoped[child.scopedSlot] ||= [];
            scoped[child.scopedSlot].push(child);
          } else {
            const slotName = child?.slot || "default";
            named[slotName] ||= [];
            named[slotName].push(child);
          }
        });

      return {
        scoped: Object.entries(scoped).map((item) => ({ name: item[0], children: item[1] })),
        named: Object.entries(named).map((item) => ({ name: item[0], children: item[1] })),
      };
    });

    const isDom = computed(() => {
      return isOriginTag(renderField.value?.component);
    });

    const render = pipeline(
      ...[
        ...services.beforeRenderHandlers.map((item) => item.handler),
        () => (field, next) => {
          if (field?.component !== "slot") {
            return next(field);
          }

          next({
            component: markRaw(JSlot),
            props: {
              renderSlot: () => {
                const renderer = slots[field.name || "default"];
                return renderer && renderer(field.props || {});
              },
            },
          });
        },
        () => (field, next) => {
          renderField.value = injector(getProxyDefine(field));
          next(renderField.value);
        },
        ...services.renderHandlers.map((item) => item.handler),
        () => (field, next) => {
          renderField.value = field;
          next(renderField.value);
        },
      ].map((provider) => provider(sharedServices)),
    );

    const getTemplateScope = (s) => {
      return Object.keys(s || {}).length ? s : undefined;
    };

    watch(
      () => props.field,
      () => {
        if (props.field) {
          render(assignObject(getProxyDefine(toRaw(props.field))));
        }
      },
    );

    onMounted(() => {
      if (props.field) {
        render(assignObject(getProxyDefine(toRaw(props.field))));
      }
    });

    return {
      renderField,
      services,
      renderSlots,
      isDom,
      getTemplateScope,
    };
  },
});
</script>

<template>
  <component
    v-if="isDom"
    :is="renderField.component"
    v-bind="renderField.props"
    v-on="renderField.events"
  >
    <JNode
      v-for="(child, index) in renderField.children || []"
      :key="child.key || index"
      :field="child"
      :scope="scope"
      :context="context"
    />
  </component>
  <component
    v-else-if="renderField && renderField.component && renderSlots.scoped.length > 0"
    :is="services.components[renderField.component] || renderField.component"
    v-bind="renderField.props"
    v-on="renderField.events"
  >
    <template v-for="slot in renderSlots.scoped" #[slot.name]="temp">
      <JNode
        v-for="(child, index) in slot.children"
        :key="child.key || index"
        :field="child"
        :scope="scope"
        :temp="getTemplateScope(temp)"
        :context="context"
      />
    </template>
  </component>
  <component
    v-else-if="renderField && renderField.component"
    :is="services.components[renderField.component] || renderField.component"
    v-bind="renderField.props"
    v-on="renderField.events"
  >
    <template v-for="slot in renderSlots.named" #[slot.name]>
      <JNode
        v-for="(child, index) in slot.children"
        :key="child.key || index"
        :field="child"
        :scope="scope"
        :context="context"
      />
    </template>
  </component>
</template>
