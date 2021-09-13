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
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      // external: ["vue"],
      // output: {
      //   // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
      //   globals: {
      //     vue: "Vue",
      //   },
      // },
    },
    // rollupOptions: {
    //   input: path.resolve(__dirname, "./lib"),
    // },
  },
});

export default mergeConfig(base, config);
