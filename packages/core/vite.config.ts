import path from "path";
import { defineConfig, mergeConfig } from "vite";
import base from "../../build/vite.base";
import babel from "rollup-plugin-babel";

const config = defineConfig({
  // plugins,
  build: {
    lib: {
      entry: path.resolve(__dirname, "lib"),
      name: "JRender",
      fileName: (format) => `index.${format}.js`,
    },
    sourcemap: true,
    rollupOptions: {
      external: ["vue", "@vue/composition-api"],
      output: {
        globals: {
          vue: "Vue",
          "@vue/composition-api": "VueCompositionAPI",
        },
      },
      plugins: [
        babel({
          presets: [
            [
              "@babel/env",
              { modules: false, targets: { browsers: "> 1%, IE 11" }, useBuiltIns: "usage" },
            ],
          ],
        }),
      ],
    },
  },
});

export default mergeConfig(base, config);
