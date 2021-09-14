import path from "path";
import { defineConfig, mergeConfig } from "vite";
import base from "../../build/vite.base";
import { plugins } from "../../build/vite.plugin";

const config = defineConfig({
  plugins,
  build: {
    lib: {
      entry: path.resolve(__dirname, "lib"),
      name: "@jrender/core",
      fileName: (format) => `index.${format}.js`,
    },
    sourcemap: true,
    rollupOptions: {
      external: ["vue", "@vue/composition-api"],
      output: {
        globals: {
          vue: "Vue",
        },
      },
    },
  },
});

export default mergeConfig(base, config);
