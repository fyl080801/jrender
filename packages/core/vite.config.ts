import path from "path";
import { defineConfig, mergeConfig } from "vite";
import base from "../../build/vite.base";
import { babel } from "@rollup/plugin-babel";
// import { plugins } from "../../build/vite.plugin";

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
          exclude: ["node_modules/**"],
          babelHelpers: "runtime",
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
          plugins: [
            "@babel/transform-runtime",
            // "@vue/babel-plugin-jsx",
            // ["@babel/plugin-proposal-decorators", { legacy: true }],
          ],
        }),
      ],
    },
  },
});

export default config; // mergeConfig(base, config);
