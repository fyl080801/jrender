import { JRender as Render, JNode } from "./components";

export { Render as JRender, JNode };
export { useRootRender } from "./utils/mixins";
export { useGlobalRender } from "./utils/service";
export * from "./utils/helper";
export * from "./utils/proxy";

const install: any = function (Vue: any) {
  if (install.installed) {
    return;
  }

  Vue.component(Render.name || "JRender", Render);
};

if (typeof window !== "undefined" && window.Vue && window["VueCompositionAPI"]) {
  const { Vue, VueCompositionAPI } = window as any;

  Vue.use(VueCompositionAPI);

  install(Vue);
}

export default {
  install,
  ...Render,
};
