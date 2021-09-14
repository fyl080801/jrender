// import { Fragment } from "vue-fragment";
import {
  computed,
  isReactive,
  reactive,
  watch,
  ref,
  onBeforeUnmount,
  nextTick,
  set,
  defineComponent,
  h,
} from "@vue/composition-api";
import JNode from "./JNode";
import { useJRender, useRootRender } from "../utils/mixins";
import { globalServiceProvider, mergeServices, createServiceProvider } from "../utils/service";
import { deepClone, isArray, isFunction, assignArray, assignObject } from "../utils/helper";
import { injectProxy } from "../utils/proxy";

export default defineComponent({
  props: {
    fields: { type: [Array, Object], default: () => [] },
    value: { type: Object, default: () => ({}) },
    listeners: { type: Array, default: () => [] },
    dataSource: { type: Object, default: () => ({}) },
  },
  emits: ["setup", "input"],
  setup(props, { emit, slots }) {
    const provider = createServiceProvider();
    const rootServices = useRootRender();

    emit("setup", provider.getSetting());

    const context = reactive({
      model: isReactive(props.value) ? props.value : reactive(props.value),
    });

    const mergedServices: any = mergeServices(
      globalServiceProvider.getServices(),
      rootServices,
      provider.getServices(),
    );

    useJRender({
      context,
      slots,
      // fields: props.fields,
      mergedServices,
    }) as Record<string, unknown>;

    watch(
      () => (context as Record<string, unknown>).model,
      (value) => {
        emit("input", value);
      },
      {},
    );

    const injector = injectProxy({
      context,
      proxy: mergedServices.proxy.map((p: any) => p({ functional: mergedServices.functional })),
    });

    // datasource
    watch(
      () => props.dataSource,
      (value) => {
        Object.keys(value || {}).forEach((key) => {
          const info = value[key];
          const provider = mergedServices.dataSource[info.type || "default"];

          if (["model", "scope", "arguments", "refs"].indexOf(key) < 0 && isFunction(provider)) {
            set(
              context,
              key,
              provider(() => injector(info.options)),
            );
          }
        });
      },
      { immediate: true },
    );
    //

    //#region fields
    const roots = ref(props.fields);
    const updating = ref(false);
    const isArrayRoot = computed(() => {
      return isArray(roots.value);
    });
    watch(
      () => props.fields,
      (value) => {
        updating.value = true;

        nextTick(() => {
          roots.value = isArray(value) ? assignArray(value) : assignObject(value as any);
          updating.value = false;
        });
      },
      {},
    );
    //#endregion

    //#region listeners 监听
    const watchs = ref([] as any[]);
    watch(
      () => props.listeners,
      (value) => {
        watchs.value.forEach((watcher) => watcher());

        if (!value || !isArray(value)) {
          return;
        }

        watchs.value = value.map((item: any) => {
          const injected: any = injector(deepClone(item));

          const watcher = isFunction(injected.watch) ? injected.watch : () => injected.watch;

          return watch(
            watcher,
            () => {
              injected.actions.forEach((act: any) => {
                if (act.condition === undefined || !!act.condition) {
                  if (act.timeout) {
                    setTimeout(() => act.handler(), act.timeout);
                  } else {
                    act.handler();
                  }
                }
              });
            },
            {
              deep: injected.deep,
              immediate: injected.immediate,
            },
          );
        });
      },
      { deep: false, immediate: true },
    );

    onBeforeUnmount(() => {
      watchs.value.forEach((watcher) => watcher());
    });
    //#endregion

    return () =>
      isArrayRoot.value
        ? h(
            "div",
            {},
            roots.value.map((field: any) => h(JNode, { props: { field, scope: {} } })),
          )
        : h(JNode, { props: { field: roots, scope: {} } });
  },
});
