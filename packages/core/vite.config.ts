import path from "path";
import { defineConfig, mergeConfig } from "vite";
import base from "../../build/vite.base";
import { plugins } from "../../build/vite.plugin";

const config = defineConfig({
  resolve: {
    dedupe: ["vue-demi"],
  },
  plugins,
  build: {
    lib: {
      entry: path.resolve(__dirname, "lib"),
      name: "@jrender/core",
      fileName: (format) => `index.${format}.js`,
    },
  },
});

export default mergeConfig(base, config);
