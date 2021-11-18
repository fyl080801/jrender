import { watch, reactive, nextTick, defineComponent, h, markRaw } from "@vue/composition-api";
import { JNode, deepGet, assignObject, toPath } from "@jrender-legacy/core";

export default ({ onBeforeRender, onRender, addDataSource, addComponent }) => {
  // type 简写
  onBeforeRender(({ props }) => {
    if (props.field?.type !== undefined) {
      props.field.component = props.field.type;
    }

    return (field, next) => {
      next(field);
    };
  }).name("type");

  onBeforeRender(() => (field, next) => {
    if (typeof field.value === "string") {
      const source = toPath(field.value);
      const arr = field.value.replace(source[0], "");
      field.props ||= {};
      field.props.value = `$:GET(${source[0]}, '${arr}')`;
      field.events ||= {};
      field.events.input = `$:(e)=>SET(${source[0]}, '${arr}', e.target.value)`;
    }

    next(field);
  });

  // 条件显示
  onBeforeRender(() => (field, next) => {
    if (typeof field?.condition === "string") {
      field.condition = `$:()=>${field?.condition}`;
    }

    next(field);
  }).name("condition");

  onRender(() => {
    let watcher = null;

    return (field, next) => {
      if (watcher) {
        watcher();
      }

      if (typeof field?.condition === "function") {
        watcher = watch(
          field?.condition,
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

  // innerText
  onRender(() => (field, next) => {
    if (field?.props?.innerText !== undefined) {
      const props = { content: field.props?.innerText };
      const text = { component: "textbox", props };
      Object.defineProperty(props, "content", {
        get() {
          return field.props?.innerText;
        },
      });
      field.children = [text];
    }

    next(field);
  });

  onRender(() => {
    return (field, next) => {
      if (typeof field?.model === "string") {
        const source = toPath(field.model);
        const arr = field.model.replace(source[0], "");

        field.props ||= {};
        field.props.value = `$:GET(${source[0]}, '${arr}', ${field.defaultValue})`;

        field.events ||= {};
        field.events.input = `$:(e)=>SET(${source[0]}, '${arr}', e)`;
      }

      next(field);
    };
  });

  const forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/;

  // for 表达式，还不知道怎么具体实现vue的for
  onRender(({ context }) => {
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
                setup() {
                  return () =>
                    h(
                      defineComponent({
                        setup(props, ctx) {
                          // 不是个好办法
                          return () => h("div", null, ctx.slots.default && ctx.slots.default());
                        },
                      }),
                      null,
                      deepGet(context, source)?.map((item, index) => {
                        return h(JNode, {
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

  addComponent(
    "textbox",
    defineComponent({
      props: {
        content: String,
      },
      setup(props) {
        return () => {
          return h("span", { domProps: { innerText: props.content } });
        };
      },
    }),
  );
};
