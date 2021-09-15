import { defineComponent, h, ref, watch } from "@vue/composition-api";
import { assignObject, deepClone, isFunction } from "../utils/helper";
import { useJRender, useVueHelper } from "../utils/mixins";
import { injectProxy, getProxyRaw } from "../utils/proxy";
import { pipeline } from "../utils/pipeline";

export default defineComponent({
  name: "JNode",
  props: {
    field: { type: Object, required: true },
    scope: { type: [Object, String, Number, Boolean], default: () => ({}) },
  },
  setup: (props) => {
    const { isVNode } = useVueHelper();

    const { context, mergedServices, slots }: any = useJRender();

    const proxy = mergedServices.proxy.map((p) => p({ functional: mergedServices.functional }));

    const injector = injectProxy({
      context: assignObject({}, context, { scope: props.scope }),
      proxy,
    });

    const renderField = ref();

    const renderChildren = ref([]);

    watch(
      () => props.field,
      (value) => {
        // 目的是让 beforerender 决定什么时候渲染这个节点
        pipeline(...mergedServices.beforeRenderHandlers, (field, next) => {
          renderField.value = injector(field);
          next(renderField.value);
        })(assignObject(value));
      },
      { immediate: true },
    );

    watch(
      () => renderField.value?.children?.length,
      () => {
        const slotChildren: unknown[] = [];

        renderField.value?.children?.forEach((child) => {
          if (child.component === "slot") {
            const slotRender = (slots as Record<string, any>)[child.name || "default"];
            if (isFunction(slotRender)) {
              const slotNodes = slotRender(assignObject({}, child.props, props.scope));
              slotNodes.forEach((node) => {
                slotChildren.push(node);
              });
            }
          } else {
            slotChildren.push(getProxyRaw(child));
          }
        });

        renderChildren.value = slotChildren?.map((field: any) => {
          return isVNode(field)
            ? field
            : h("JNode", {
                props: { field, scope: props.scope },
                slot: field.options?.slot,
              });
        }) as any;
      },
      { immediate: true },
    );

    return () => {
      if (!renderField.value) {
        return;
      }

      const renderComponent =
        mergedServices.components[renderField.value?.component] || renderField.value?.component;

      let rending = {
        component: renderComponent,
        options: deepClone(renderField.value?.options || {}),
        children: renderChildren.value,
      };

      for (let i = 0; i < mergedServices.renderHandlers.length; i++) {
        if (rending) {
          rending = mergedServices.renderHandlers[i](rending);
        }
      }

      return (
        rending && rending.component && h(rending.component, rending.options, rending.children)
      );
    };
  },
});
