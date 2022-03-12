import { JNode, getProxyDefine, Setup } from "@jrender-legacy/core";
import { inject, provide, getCurrentInstance, defineComponent, h } from "@vue/composition-api";

export const ElementExtends = ({ onBeforeBind }: Setup) => {
  const formToken = Symbol("form");

  onBeforeBind(() => {
    return (field, next) => {
      const { inform } = getCurrentInstance()
        ? inject(formToken, { inform: false }) || {}
        : { inform: false };

      if (!inform || field?.formItem === undefined) {
        return next(field);
      }

      const props = field.formItem;
      delete field.formItem;

      next({ component: "el-form-item", condition: field.condition, props, children: [field] });
    };
  });

  onBeforeBind(() => {
    return (field, next) => {
      if (field?.component === "el-form") {
        provide(formToken, { inform: true });
      }

      next(field);
    };
  }).depend("type");

  onBeforeBind(({ context, scope, injector }) => {
    return (field, next) => {
      if (field?.component === "el-tabs") {
        next({
          component: defineComponent({
            setup() {
              return () =>
                h(
                  field.component,
                  { ...injector(field) },
                  field.children?.map((child) => {
                    return h(
                      child.component,
                      { ...injector(child) },
                      child.children?.map((tab) => {
                        return h(JNode, {
                          props: { field: getProxyDefine(tab), context, scope },
                        });
                      }),
                    );
                  }),
                );
            },
          }),
        });
      } else {
        next(field);
      }
    };
  });
};
