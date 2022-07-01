import Vue2 from "@vitejs/plugin-vue2";
// import ViteComponents from "vite-plugin-components";
import legacy from "@vitejs/plugin-legacy";
import WindiCSS from "vite-plugin-windicss";

export const viteVue = Vue2({});

export const viteLegacy = legacy({
  targets: ["ie >= 11"],
  additionalLegacyPolyfills: ["regenerator-runtime/runtime"],
});

export const windicss = WindiCSS();

export const plugins = [viteVue, viteLegacy, windicss];
