import {
  computed,
  defineComponent,
  ref,
  markRaw,
  watch,
  h,
  getCurrentInstance,
  onMounted,
  onUpdated,
} from "vue";
import { isOriginTag } from "../utils/domTags";
import { assignObject, deepClone } from "../utils/helper";
import { useJRender } from "../utils/mixins";
import { pipeline } from "../utils/pipeline";
import { getProxyDefine, injectProxy } from "../utils/proxy";
import JSlot from "./JSlot";

const JNode = defineComponent({
  name: "JNode",
  props: {
    field: Object,
    scope: { type: Object, default: () => ({}) },
    context: { type: Object, required: true },
  },
  setup(props, ctx) {
    const { proxy } = getCurrentInstance();
    const { services, slots } = useJRender();

    // 共享给中间件的资源
    const sharedServices = {
      context: props.context,
      scope: props.scope,
      props,
      services,
      injector: (target) => {
        return injector(target);
      },
      render: () => {
        if (props.field) {
          render(props.field);
        }
      },
    };

    const injector = injectProxy({
      context: props.context,
      scope: props.scope,
      proxy: services?.proxy?.map((p) => p({ functional: services.functional })),
    });

    const renderField = ref();

    const renderSlots = computed<any>(() => {
      if (!renderField.value) {
        return { scoped: {}, named: {} };
      }

      const { scoped, named } = renderField.value?.children
        ?.filter((child) => child)
        .reduce(
          ({ scoped, named }, child) => {
            if (child.scopedSlot) {
              scoped[child.scopedSlot] = [...(scoped[child.scopedSlot] || []), child];
            } else {
              const slotName = child?.slot || "default";
              named[slotName] = [...(named[slotName] || []), child];
            }
            return { scoped, named };
          },
          { scoped: {}, named: {} },
        ) || { scoped: {}, named: {} };

      return {
        scoped: Object.keys(scoped).map((key) => ({ name: key, children: scoped[key] })),
        named: Object.keys(named).map((key) => ({ name: key, children: named[key] })),
      };
    });

    const isDom = computed(() => {
      return isOriginTag(renderField.value?.component);
    });

    const render = pipeline(
      ...[
        ...services.beforeBindHandlers.map((item) => item.handler),
        () => (field, next) => {
          if (field?.component !== "slot") {
            return next(field);
          }

          next({
            component: markRaw(JSlot),
            props: {
              renderSlot: () => {
                const renderer = slots[field.name || "default"];
                return typeof renderer === "function" && renderer(field.scope || {});
              },
            },
          });
        },
        () => (field, next) => {
          renderField.value = injector(field);
          next(renderField.value);
        },
        ...services.bindHandlers.map((item) => item.handler),
        () => (field, next) => {
          renderField.value = field;
          next(renderField.value);
        },
      ].map((provider) => provider(sharedServices)),
    );

    // 此处不要动
    watch(
      () => props.field,
      () => {
        if (props.field) {
          render(props.field);
        }
      },
      { immediate: true },
    );

    onMounted(() => {
      if (renderField.value?.ref) {
        // eslint-disable-next-line vue/no-mutating-props
        props.context.refs[renderField.value.ref] = proxy.$refs[renderField.value.ref];
      }

      ctx.emit("rendered");
    });

    onUpdated(() => {
      if (renderField.value?.ref) {
        // eslint-disable-next-line vue/no-mutating-props
        props.context.refs[renderField.value.ref] = proxy.$refs[renderField.value.ref];
      }
    });

    return () => {
      if (isDom.value) {
        return h(
          renderField.value.component,
          {
            ref: renderField.value.ref,
            attrs: deepClone(renderField.value.attrs),
            props: renderField.value.props,
            domProps: deepClone(renderField.value.domProps),
            on: deepClone(renderField.value.on),
            nativeOn: deepClone(renderField.value.nativeOn),
            style: deepClone(renderField.value.style),
            class: deepClone(renderField.value.class),
          },
          (renderField.value.children || []).map((child, index) => {
            return h(JNode, {
              key: child.key || index,
              props: { field: getProxyDefine(child), scope: props.scope, context: props.context },
            });
          }),
        );
      } else if (renderField.value && renderField.value.component) {
        return h(
          services.components[renderField.value.component] || renderField.value.component,
          {
            ref: renderField.value.ref,
            attrs: deepClone(renderField.value.attrs),
            props: renderField.value.props, // 考虑到可能嵌套组件，如果深度克隆会出问题
            domProps: deepClone(renderField.value.domProps),
            on: deepClone(renderField.value.on),
            nativeOn: deepClone(renderField.value.nativeOn),
            scopedSlots: renderSlots.value.scoped.reduce((target, item) => {
              target[item.name] = (s) => {
                return (item.children || []).map((field, index) => {
                  return h(JNode, {
                    key: field.key || index,
                    props: {
                      field: getProxyDefine(field),
                      scope: assignObject(props.scope, s),
                      context: props.context,
                    },
                  });
                });
              };
              return target;
            }, {}),
            style: deepClone(renderField.value.style),
            class: deepClone(renderField.value.class),
          },
          renderSlots.value.named.reduce((target, item) => {
            item.children.forEach((field, index) => {
              target.push(
                h(JNode, {
                  key: field.key || index,
                  slot: item.name,
                  props: {
                    field: getProxyDefine(field),
                    scope: props.scope,
                    context: props.context,
                  },
                }),
              );
            });
            return target;
          }, []),
        );
      }
    };
  },
});

export default JNode;
