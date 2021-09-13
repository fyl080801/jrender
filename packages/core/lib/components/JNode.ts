import { defineComponent, h, ref, watch } from "vue-demi";
import { assignObject, deepClone } from "../utils/helper";
import { useJRender, useRootRender, useVueHelper } from "../utils/mixins";
import { injectProxy, getProxyRaw } from "../utils/proxy";
import { globalServiceProvider, mergeServices } from "../utils/service";

export default defineComponent({
  name: "JNode",
  props: {
    field: { type: Object, required: true },
    scope: { type: [Object, String, Number, Boolean], default: () => ({}) },
  },
  setup: (props) => {
    const { isVNode } = useVueHelper();

    const { context, innerServices, slots }: Record<string, unknown> = useJRender() as Record<
      string,
      unknown
    >;

    const rootServices = useRootRender();

    const mergedServices: any = mergeServices(
      globalServiceProvider.getServices(),
      rootServices,
      innerServices,
    );

    const proxy = mergedServices.proxy.map((p: any) =>
      p({ functional: mergedServices.functional }),
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

        for (let i = 0; i < mergedServices.beforeRenderHandlers.length; i++) {
          if (node) {
            node = mergedServices.beforeRenderHandlers[i](node);
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
