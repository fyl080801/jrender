// import "@babel/polyfill";
import { JRender, JNode } from "./components";

export { JRender, JNode };
export { useRootRender } from "./utils/mixins";
export { useGlobalRender } from "./utils/service";
export * from "./utils/helper";
export * from "./utils/proxy";

const install: any = function (Vue: any) {
  if (install.installed) {
    return;
  }

  Vue.component(JRender.name, JRender);
};

if (typeof window !== "undefined" && window.Vue) {
  install(window.Vue);
}

export default {
  install,
  ...JRender,
};
