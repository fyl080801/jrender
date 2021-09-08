import path from "path";
import fs from "fs";
import { defineConfig } from "vite";
import { createVuePlugin } from "vite-plugin-vue2";
import ViteComponents from "vite-plugin-components";
// import WindiCSS from "vite-plugin-windicss";
import ViteIcons, { ViteIconsResolver } from "vite-plugin-icons";
import legacy from "@vitejs/plugin-legacy";
import ScriptSetup from "unplugin-vue2-script-setup/vite";

const packages = fs.readdirSync(path.resolve(__dirname, "packages")).reduce((target, p) => {
  target[`@jrender/${p}`] = path.resolve(__dirname, `packages/${p}/lib`);
  return target;
}, {});

const config = defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      ...packages,
    },
    dedupe: ["vue-demi"],
  },
  build: {
    minify: true,
  },
  plugins: [
    createVuePlugin(),
    ViteComponents({
      customComponentResolvers: [
        ViteIconsResolver({
          componentPrefix: "",
        }),
      ],
    }),
    ViteIcons({
      defaultStyle: "",
    }),
    // WindiCSS(),
    ScriptSetup({}),
    legacy({
      targets: ["defaults", "not IE 11"],
    }),
  ],
  server: {
    port: 8080,
  },
});

export default config;
