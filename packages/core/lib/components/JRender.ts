import {
  watch,
  computed,
  defineComponent,
  reactive,
  set,
  h,
  getCurrentInstance,
  ref,
} from "@vue/composition-api";
import { isArray, isFunction } from "../utils/helper";
import { useJRender, useListener, useServices } from "../utils/mixins";
import { injectProxy } from "../utils/proxy";
import JNode from "./JNode";

export default defineComponent({
  name: "JRender",
  components: {
    JNode,
  },
  props: {
    value: { type: Object, default: () => ({}) },
    fields: { type: [Array, Object], default: () => [] },
    listeners: { type: Array, default: () => [] },
    dataSource: { type: Object, default: () => ({}) },
  },
  setup(props, ctx) {
    const { proxy } = getCurrentInstance();

    const renderedCount = ref(0);

    const services = useServices({
      emit: ctx.emit,
    });

    const context = reactive({
      model: props.value,
      refs: {},
    });

    const isArrayRoot = computed(() => {
      return isArray(props.fields);
    });

    const childCount = computed(() => {
      return isArrayRoot.value ? props.fields.length : 1;
    });

    const injector = injectProxy({
      context,
      scope: {},
      proxy: services.proxy.map((p) => p({ functional: services.functional })),
    });

    useJRender({
      services,
      props,
      slots: ctx.slots,
    });

    // dataSource
    watch(
      () => props.dataSource,
      (value, origin) => {
        Object.keys(origin || {}).forEach((key) => {
          delete context[key];
        });

        Object.keys(value || {}).forEach((key) => {
          const info = value[key];
          const provider = services.dataSource[info.type || "default"];

          if (["model", "scope", "arguments", "refs"].indexOf(key) < 0 && isFunction(provider)) {
            set(
              context,
              key,
              provider(() => injector(info.props)),
            );
          }
        });
      },
      { immediate: true },
    );

    watch(
      () => context.model,
      (value) => {
        ctx.emit("input", value);
      },
      { deep: false },
    );

    useListener(props, { injector });

    const onChildRendered = () => {
      if (renderedCount.value !== childCount.value - 1) {
        renderedCount.value += 1;
        return;
      }

      const elm = proxy.$el;

      const parentElm = elm.parentNode;

      let current = elm;

      const append = (item) => {
        parentElm.insertBefore(item, current);
        current = item;
      };

      for (let i = elm.childNodes.length - 1; i >= 0; i--) {
        append(elm.childNodes.item(i));
      }

      elm.remove();
      console.log("sss");
    };

    return () =>
      h(
        "div",
        { class: "fake" },
        isArrayRoot.value
          ? props.fields.map((field) =>
              h(JNode, {
                props: {
                  field,
                  context,
                },
                on: {
                  rendered: onChildRendered,
                },
              }),
            )
          : [
              h(JNode, {
                props: {
                  field: props.fields,
                  context,
                },
                on: {
                  rendered: onChildRendered,
                },
              }),
            ],
      );
  },
});
