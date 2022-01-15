import path from "path";
import fs from "fs";
import { mergeConfig, defineConfig } from "vite";
import base from "./build/vite.base";
import { viteLegacy } from "./build/vite.plugin";
import WindiCSS from "vite-plugin-windicss";

const packages = fs.readdirSync(path.resolve(__dirname, "packages")).reduce((target, p) => {
  target[`@jrender-legacy/${p}`] = path.resolve(__dirname, `packages/${p}/lib`);
  return target;
}, {});

const config = defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      ...packages,
    },
  },
  build: {
    minify: true,
  },
  plugins: [viteLegacy, WindiCSS()],
  server: {
    port: 8080,
  },
});

export default mergeConfig(base, config);
