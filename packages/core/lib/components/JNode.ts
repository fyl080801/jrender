import { computed, defineComponent, h, ref, watch } from "vue-demi";
import { deepClone } from "../utils/helper";

export default defineComponent({
  name: "JNode",
  props: { field: { type: Object, required: true } },
  setup: (props) => {
    const nodeField = ref();

    const nodeChildren = computed(() => {
      const slotChildren = nodeField.value?.children;
      return slotChildren;
    });

    watch(
      () => ({ ...props.field, children: undefined }),
      (value) => {
        if (!value) {
          return;
        }

        const node = {
          ...deepClone(value),
          children: props.field.children,
        };

        nodeField.value = node;
      },
      { deep: true, immediate: true }
    );

    return () => {
      const renderField = nodeField.value.component;

      const renderChildren = nodeChildren.value?.map((field: unknown) => {
        return h("JNode", { props: { field } });
      });

      return renderField && h(renderField, deepClone(nodeField.value.options), renderChildren);
    };
  },
});
