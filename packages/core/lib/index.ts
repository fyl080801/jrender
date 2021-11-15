import { JRender, JNode } from "./components";

export { JRender, JNode };
export { useRootRender } from "./utils/mixins";
export { useGlobalRender } from "./utils/service";
export * from "./utils/helper";

const install: any = function (Vue: any) {
  if (install.installed) {
    return;
  }

  Vue.component("jrender", JRender);
};

if (typeof window !== "undefined" && window.Vue) {
  install(window.Vue);
}

export default {
  install,
  ...JRender,
};
