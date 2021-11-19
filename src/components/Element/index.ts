import { inject, provide, getCurrentInstance } from "@vue/composition-api";

export default ({ onBeforeRender }) => {
  const formToken = Symbol("form");

  onBeforeRender(() => {
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

  onBeforeRender(() => {
    return (field, next) => {
      if (field?.component === "el-form") {
        provide(formToken, { inform: true });
      }

      next(field);
    };
  }).depend("type");
};
