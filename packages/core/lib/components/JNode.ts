import { computed, defineComponent, ref, markRaw, toRaw, watch, h } from "@vue/composition-api";
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
  setup(props) {
    const { services, slots } = useJRender();

    // 共享给中间件的资源
    const sharedServices = {
      context: props.context,
      scope: props.scope,
      props,
      injector: (target) => {
        return injector(target);
      },
      render: () => {
        if (props.field) {
          render(assignObject(getProxyDefine(toRaw(props.field))));
        }
      },
    };

    const injector = injectProxy({
      context: props.context,
      scope: props.scope,
      proxy: services.proxy.map((p) => p({ functional: services.functional })),
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
        ...services.beforeRenderHandlers.map((item) => item.handler),
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
          renderField.value = injector(getProxyDefine(field));
          next(renderField.value);
        },
        ...services.renderHandlers.map((item) => item.handler),
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
          render(assignObject(getProxyDefine(toRaw(props.field))));
        }
      },
      { immediate: true },
    );

    return () => {
      if (isDom.value) {
        return h(
          renderField.value.component,
          {
            attrs: renderField.value.attrs,
            props: renderField.value.props,
            domProps: renderField.value.domProps,
            on: injector(deepClone(getProxyDefine(renderField.value.on))),
            nativeOn: injector(deepClone(getProxyDefine(renderField.value.nativeOn))),
            style: renderField.value.style,
            class: renderField.value.class,
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
            attrs: renderField.value.attrs,
            props: renderField.value.props,
            domProps: renderField.value.domProps,
            on: injector(deepClone(getProxyDefine(renderField.value.on))),
            nativeOn: injector(deepClone(getProxyDefine(renderField.value.nativeOn))),
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
            style: renderField.value.style,
            class: renderField.value.class,
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
