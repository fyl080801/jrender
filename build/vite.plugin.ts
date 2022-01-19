import { createVuePlugin } from "vite-plugin-vue2";
import ViteComponents from "vite-plugin-components";
import ViteIcons, { ViteIconsResolver } from "vite-plugin-icons";
import ScriptSetup from "unplugin-vue2-script-setup/vite";
import legacy from "@vitejs/plugin-legacy";
import { getBabelOutputPlugin } from "@rollup/plugin-babel";

export const viteVue = createVuePlugin();

export const viteComponents = ViteComponents({
  customComponentResolvers: [
    ViteIconsResolver({
      componentPrefix: "",
    }),
  ],
});

export const viteIcon = ViteIcons({
  defaultStyle: "",
});

export const scriptSetup = ScriptSetup({});

export const viteLegacy = legacy({
  targets: ["ie >= 11"],
  additionalLegacyPolyfills: ["regenerator-runtime/runtime"],
  // polyfills: ["es.array.iterator", "es6.symbol"],
});

export const babel = getBabelOutputPlugin({
  exclude: ["node_modules/**"],
  allowAllFormats: true,
  presets: [
    [
      "@babel/preset-env",
      {
        useBuiltIns: "usage",
        targets: "> 0.25%, IE >= 11",
        corejs: 3,
      },
    ],
  ],
  plugins: ["@babel/transform-runtime", "@babel/syntax-dynamic-import"],
});

export const plugins = [viteVue, viteComponents, viteIcon, scriptSetup];
