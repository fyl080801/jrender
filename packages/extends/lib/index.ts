import {
  watch,
  reactive,
  nextTick,
  defineComponent,
  h,
  markRaw,
  onBeforeUnmount,
  computed,
} from "@vue/composition-api";
import { JNode, deepGet, assignObject, toPath, compute } from "@jrender-legacy/core";

export default ({ onBeforeRender, onRender, addDataSource }) => {
  // type 简写
  onBeforeRender(({ props }) => {
    if (props.field?.type !== undefined) {
      props.field.component = props.field.type;
    }

    return (field, next) => {
      next(field);
    };
  }).name("type");

  // 条件显示
  onBeforeRender(() => (field, next) => {
    if (typeof field?.condition === "string") {
      field.condition = `$:()=>${field?.condition}`;
    }

    next(field);
  }).name("condition");

  onRender(() => {
    let watcher = null;

    onBeforeUnmount(() => {
      watcher && watcher();
    });

    return (field, next) => {
      watcher && watcher();

      if (typeof field?.condition === "function") {
        watcher = watch(
          field.condition,
          (value) => {
            if (value !== undefined && !value) {
              next({});
            } else {
              next(field);
            }
          },
          { immediate: true },
        );
      } else {
        next(field);
      }
    };
  }).name("condition");

  // model
  onRender(() => {
    return (field, next) => {
      if (typeof field?.model === "string") {
        const source = toPath(field.model);
        const arr = field.model.replace(source[0], "");

        field.props ||= {};
        field.props.value = `$:${field.model}`;

        field.on ||= {};
        field.on.input = `$:(e)=>SET(${source[0]}, '${arr}', e)`;
      }

      next(field);
    };
  });

  // domvalue
  onRender(() => (field, next) => {
    if (typeof field?.domValue === "string") {
      const source = toPath(field.domValue);
      const arr = field.domValue.replace(source[0], "");
      field.domProps ||= {};
      field.domProps.value = `$:${field.domValue}`;
      field.on ||= {};
      field.on.input = `$:(e)=>SET(${source[0]}, '${arr}', e.target.value)`;
    }

    next(field);
  });

  // propValue
  onRender(() => (field, next) => {
    if (typeof field.propValue === "string") {
      const source = toPath(field.propValue);
      const arr = field.propValue.replace(source[0], "");
      field.props ||= {};
      field.props.value = `$:${field.propValue}`;
      field.on ||= {};
      field.on.input = `$:(e)=>SET(${source[0]}, '${arr}', e.target.value)`;
    }

    next(field);
  });

  const forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/;

  // for 表达式，还不知道怎么具体实现vue的for
  onRender(({ context, services }) => {
    return (field, next) => {
      if (!field) {
        return next(field);
      }

      field.children = field?.children?.map((child) => {
        const matched = forAliasRE.exec(child.for);
        if (matched) {
          const [origin, prop, source] = matched;
          return {
            component: markRaw(
              defineComponent({
                components: {
                  "inner-node": JNode,
                },
                setup() {
                  const forList = computed(() => {
                    return compute({ functional: services.functional })(`$:${source}`)(context);
                  });

                  return () =>
                    h(
                      defineComponent({
                        setup(props, ctx) {
                          // 不是个好办法
                          return () => h("div", null, ctx.slots.default && ctx.slots.default());
                        },
                      }),
                      null,
                      forList.value?.map((item, index) => {
                        return h("inner-node", {
                          props: {
                            field: assignObject(child, { for: undefined }),
                            scope: { [prop]: item, index },
                            context,
                          },
                        });
                      }),
                    );
                },
              }),
            ),
          };
        } else {
          return child;
        }
      });

      next(field);
    };
  });

  addDataSource("fetch", (opt) => {
    const { autoLoad } = opt();
    const instance = reactive({
      fetch: async () => {
        const options: any = opt();
        try {
          instance.loading = true;

          const response: any = await fetch(options.url, options.props);
          const result = await response[options.type || "json"]();
          setTimeout(() => {
            instance.data = result;
            instance.loading = false;
          }, options.fakeTimeout || 0);
        } catch {
          instance.data = options.defaultData || [];
          instance.loading = false;
        }
      },
      clear: () => {
        instance.data = opt()?.defaultData || [];
      },
      loading: false,
      data: opt()?.defaultData || [],
    });

    if (autoLoad) {
      nextTick(() => {
        instance.fetch();
      });
    }

    return instance;
  });
};
