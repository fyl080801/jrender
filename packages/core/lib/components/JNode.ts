import { defineComponent, h, getCurrentInstance } from "vue-demi";
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
    const {
      components,
      context,
      beforeRenderHandlers,
      functional,
      proxy,
      slots,
    }: Record<string, unknown> = useJRender() as Record<string, unknown>;

    const innerFunctional = assignObject({ UPDATE, GET }, functional as Record<string, unknown>);
    const innerProxy = assignArray([compute({ functional: innerFunctional })], proxy);
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

    return () => {
      if (!props.field) {
        return;
      }

      let nodeField = assignObject(deepClone({ ...props.field, children: undefined }), {
        children: props.field.children,
      });

      const beforeHandlers = assignArray([], beforeRenderHandlers);

      for (let i = 0; i < beforeHandlers.length; i++) {
        if (nodeField) {
          nodeField = beforeHandlers[i](nodeField);
        }
      }

      const renderField = injector(nodeField) as any;

      const renderComponent =
        (components as Record<string, unknown>)[renderField?.component] || renderField?.component;

      const renderChildren = getChildren(renderField?.children)?.map((field: any) => {
        return field instanceof VNodeType
          ? field
          : h("JNode", { props: { field, scope: props.scope }, slot: field.options?.slot });
      });

      return renderComponent && h(renderComponent, renderField.options, renderChildren);
    };
  },
});
