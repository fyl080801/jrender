import { computed, defineComponent, ref, markRaw, toRaw, watch, h } from "@vue/composition-api";
import { isOriginTag } from "../utils/domTags";
import { assignObject } from "../utils/helper";
import { useJRender, useScope } from "../utils/mixins";
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

    const { scope } = useScope(props.scope);

    const sharedServices = {
      context: props.context,
      scope,
      props,
    };

    const injector = injectProxy({
      context: props.context,
      scope,
      proxy: services.proxy.map((p) => p({ functional: services.functional })),
    });

    const renderField = ref();

    const renderSlots = computed<any>(() => {
      if (!renderField.value) {
        return [];
      }

      const scoped = {};
      const named = {};

      renderField.value?.children
        ?.filter((child) => child)
        .forEach((child) => {
          if (child.scopedSlot) {
            scoped[child.scopedSlot] ||= [];
            scoped[child.scopedSlot].push(child);
          } else {
            const slotName = child?.slot || "default";
            named[slotName] ||= [];
            named[slotName].push(child);
          }
        });

      return {
        scoped: Object.entries(scoped).map((item) => ({ name: item[0], children: item[1] })),
        named: Object.entries(named).map((item) => ({ name: item[0], children: item[1] })),
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
                return renderer && renderer(field.props || {});
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
            props: renderField.value.props,
            domProps: renderField.value.domProps,
            on: renderField.value.on,
            nativeOn: renderField.value.nativeOn,
            style: renderField.value.style,
            class: renderField.value.class,
          },
          (renderField.value.children || []).map((child, index) => {
            return h(JNode, {
              key: child.key || index,
              props: { field: child, scope, context: props.context },
            });
          }),
        );
      } else if (renderField && renderField.value.component) {
        return h(
          renderField.value.component,
          {
            props: renderField.value.props,
            domProps: renderField.value.domProps,
            on: renderField.value.on,
            nativeOn: renderField.value.nativeOn,
            scopedSlots: renderSlots.value.scoped.length
              ? renderSlots.value.scoped.reduce((target, item) => {
                  target[item.name] = (s) => {
                    return (item.children || []).map((field, index) => {
                      return h(JNode, {
                        key: field.key || index,
                        props: {
                          field,
                          scope: assignObject(scope, s),
                          context: props.context,
                        },
                      });
                    });
                  };
                  return target;
                }, {})
              : null,
            style: renderField.value.style,
            ["class"]: renderField.value.class,
          },
          renderSlots.value.named.reduce((target, item) => {
            item.children.forEach((field, index) => {
              target.push(
                h(JNode, {
                  key: field.key || index,
                  slot: item.name,
                  props: { field, scope, context: props.context },
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
