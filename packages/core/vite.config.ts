import path from "path";
import { defineConfig, mergeConfig } from "vite";
// import base from "../../build/vite.base";
import { getBabelOutputPlugin } from "@rollup/plugin-babel";
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
    // target: "es6",
    rollupOptions: {
      external: ["vue", "@vue/composition-api"],
      output: {
        format: "commonjs",
        globals: {
          vue: "Vue",
          "@vue/composition-api": "VueCompositionAPI",
        },
      },
      plugins: [
        getBabelOutputPlugin({
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
          plugins: [
            "@babel/transform-runtime",
            "@babel/syntax-dynamic-import",
            // "@vue/babel-plugin-jsx",
            // ["@babel/plugin-proposal-decorators", { legacy: true }],
          ],
        }),
      ],
    },
  },
});

export default config; // mergeConfig(base, config);
