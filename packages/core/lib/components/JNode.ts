import { defineComponent, h, getCurrentInstance, reactive, ref, watch } from "vue-demi";
import { assignArray, assignObject, deepClone } from "../utils/helper";
import { compute, GET, UPDATE } from "../utils/inner";
import { useJRender } from "../utils/mixins";
import { injectProxy } from "../utils/proxy";

export default defineComponent({
  name: "JNode",
  props: {
    field: { type: Object, required: true },
    scope: { type: [Object, String, Number, Boolean], default: () => ({}) },
  },
  setup: (props) => {
    const ins = getCurrentInstance();
    const VNodeType: any = ins?.proxy.$createElement("span", "").constructor;
    const { context, innerServices, slots }: Record<string, unknown> = useJRender() as Record<
      string,
      unknown
    >;

    const innerFunctional = assignObject(
      { UPDATE, GET },
      (innerServices as Record<string, unknown>).functional as Record<string, unknown>,
    );

    const innerProxy = assignArray(
      [compute({ functional: innerFunctional })],
      (innerServices as Record<string, unknown>).proxy,
    );

    const injector = injectProxy({
      context: assignObject({}, context as Record<string, unknown>, { scope: props.scope }),
      functional: innerFunctional,
      proxy: innerProxy,
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

    const beforeHandlers = assignArray(
      [],
      (innerServices as Record<string, unknown>).beforeRenderHandlers,
    );

    let nodeField = assignObject(
      { ...props.field, children: undefined },
      {
        children: props.field.children,
      },
    );

    for (let i = 0; i < beforeHandlers.length; i++) {
      if (nodeField) {
        nodeField = beforeHandlers[i](nodeField);
      }
    }

    const renderField = reactive(injector(nodeField) as any);

    const renderChildren = ref([]);

    watch(
      () => renderField.children?.length,
      () => {
        renderChildren.value = getChildren(renderField?.children)?.map((field: any) => {
          return field instanceof VNodeType
            ? field
            : h("JNode", { props: { field, scope: props.scope }, slot: field.options?.slot });
        }) as any;
      },
      { immediate: true },
    );

    return () => {
      const renderComponent =
        ((innerServices as Record<string, unknown>).components as Record<string, unknown>)[
          renderField?.component
        ] || renderField?.component;

      return (
        renderComponent && h(renderComponent, deepClone(renderField.options), renderChildren.value)
      );
    };
  },
});
