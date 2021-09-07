import { defineComponent, h, set } from "vue-demi";
import {
  assignArray,
  assignObject,
  deepClone,
  hasOwnProperty,
  isArray,
  isNumberLike,
  toPath,
} from "../utils/helper";
import { useJRender } from "../utils/mixins";
import { injectProxy } from "../utils/proxy";

export default defineComponent({
  name: "JNode",
  props: { field: { type: Object, required: true } },
  setup: (props) => {
    const vDeepSet = (target: Record<string, unknown>, path: string, value: unknown) => {
      const fields = isArray(path) ? path : toPath(path);
      const prop = (fields as any).shift();

      if (!fields.length) {
        return set(target, prop, value);
      }

      if (!hasOwnProperty(target, prop) || target[prop] === undefined) {
        const objVal = fields.length >= 1 && isNumberLike(fields[0]) ? [] : {};
        set(target, prop, objVal);
      }

      vDeepSet((target as any)[prop], fields as any, value);
    };

    const jrender = useJRender() as Record<string, unknown>;

    const injector = injectProxy({
      context: jrender.context as Record<string, unknown>,
      functional: {
        UPDATE: (target: Record<string, unknown>, path: string, value: unknown) => {
          vDeepSet(target, path, value);
        },
      }, // assignObject(renderStore.state.functionals, rootSetup.functionals, functionals),
      proxy: [],
    });

    return () => {
      if (!props.field) {
        return;
      }

      let nodeField = assignObject(deepClone({ ...props.field, children: undefined }), {
        children: props.field.children,
      });

      const beforeHandlers = assignArray(jrender.beforeRenderHandlers);

      for (let i = 0; i < beforeHandlers.length; i++) {
        if (nodeField) {
          nodeField = beforeHandlers[i](nodeField);
        }
      }

      const renderField = injector(nodeField) as any;

      const renderChildren = renderField?.children?.map((field: unknown) => {
        return h("JNode", { props: { field } });
      });

      return (
        renderField &&
        renderField.component &&
        h(renderField.component, renderField.options, renderChildren)
      );
    };
  },
});
