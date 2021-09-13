import { defineComponent, h, ref, watch } from "vue-demi";
import { assignObject, deepClone } from "../utils/helper";
import { useJRender, useVueHelper } from "../utils/mixins";
import { injectProxy, getProxyRaw } from "../utils/proxy";

export default defineComponent({
  name: "JNode",
  props: {
    field: { type: Object, required: true },
    scope: { type: [Object, String, Number, Boolean], default: () => ({}) },
  },
  setup: (props) => {
    const { isVNode } = useVueHelper();

    const { context, mergedServices, slots }: Record<string, unknown> = useJRender() as Record<
      string,
      unknown
    >;

    const proxy = (mergedServices as any).proxy.map((p: any) =>
      p({ functional: (mergedServices as any).functional }),
    );

    const injector = injectProxy({
      context: assignObject({}, context as Record<string, unknown>, { scope: props.scope }),
      proxy,
    });

    const renderField = ref();

    const renderChildren = ref([]);

    watch(
      () => props.field,
      (value) => {
        let node = assignObject(
          { ...value, children: undefined },
          {
            children: value.children,
          },
        );

        for (let i = 0; i < (mergedServices as any).beforeRenderHandlers.length; i++) {
          if (node) {
            node = (mergedServices as any).beforeRenderHandlers[i](node);
          }
        }

        renderField.value = injector(node);
      },
      { immediate: true },
    );

    watch(
      () => renderField.value?.children?.length,
      () => {
        const slotChildren: unknown[] = [];

        renderField.value?.children?.forEach((child: any) => {
          if (child.component === "slot") {
            const slotNodes = (slots as Record<string, any>)[child.name || "default"](
              assignObject({}, child.props, props.scope),
            );
            slotNodes.forEach((node: any) => {
              slotChildren.push(node);
            });
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
      const renderComponent =
        (mergedServices as any).components[renderField.value?.component] ||
        renderField.value?.component;

      let rending = {
        component: renderComponent,
        options: deepClone(renderField.value?.options || {}),
        children: renderChildren.value,
      };

      for (let i = 0; i < (mergedServices as any).renderHandlers.length; i++) {
        if (rending) {
          rending = (mergedServices as any).renderHandlers[i](rending);
        }
      }

      return (
        rending && rending.component && h(rending.component, rending.options, rending.children)
      );
    };
  },
});
