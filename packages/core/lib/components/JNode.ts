import { defineComponent, h, reactive, ref, watch } from "vue-demi";
import { assignArray, assignObject, deepClone } from "../utils/helper";
import { useJRender, useRootRender, useVueHelper } from "../utils/mixins";
import { injectProxy } from "../utils/proxy";
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

    const getChildren = (children: unknown[]) => {
      const slotChildren: unknown[] = [];
      children?.forEach((child: any) => {
        if (child.component === "slot") {
          const slotNodes = (slots as Record<string, any>)[child.name || "default"](
            assignObject({}, child.props, props.scope),
          );
          slotNodes.forEach((node: any) => {
            slotChildren.push(node);
          });
        } else {
          slotChildren.push(child);
        }
      });

      return slotChildren;
    };

    let nodeField = assignObject(
      { ...props.field, children: undefined },
      {
        children: props.field.children,
      },
    );

    for (let i = 0; i < mergedServices.beforeRenderHandlers.length; i++) {
      if (nodeField) {
        nodeField = mergedServices.beforeRenderHandlers[i](nodeField);
      }
    }

    const renderField = reactive(injector(nodeField) as any);

    const renderChildren = ref([]);

    watch(
      () => renderField.children?.length,
      () => {
        renderChildren.value = getChildren(renderField?.children)?.map((field: any) => {
          return isVNode(field)
            ? field
            : h("JNode", { props: { field, scope: props.scope }, slot: field.options?.slot });
        }) as any;
      },
      { immediate: true },
    );

    return () => {
      const renderComponent =
        mergedServices.components[renderField?.component] || renderField?.component;

      return (
        renderComponent && h(renderComponent, deepClone(renderField.options), renderChildren.value)
      );
    };
  },
});
