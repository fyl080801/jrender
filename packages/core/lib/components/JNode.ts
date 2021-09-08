import { defineComponent, h } from "vue-demi";
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
    const {
      components,
      context,
      beforeRenderHandlers,
      functional,
      proxy,
    }: Record<string, unknown> = useJRender() as Record<string, unknown>;

    const innerFunctional = assignObject({ UPDATE, GET }, functional as Record<string, unknown>);
    const innerProxy = assignArray([compute({ functional: innerFunctional })], proxy);
    const injector = injectProxy({
      context: assignObject({}, context as Record<string, unknown>, { scope: props.scope }),
      functional: innerFunctional,
      proxy: innerProxy,
    });

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

      const renderChildren = renderField?.children?.map((field: unknown) => {
        return h("JNode", { props: { field, scope: props.scope } });
      });

      return renderComponent && h(renderComponent, renderField.options, renderChildren);
    };
  },
});
