import path from "path";
import { defineConfig } from "vite";
import { babel } from "../../build/vite.plugin";

const config = defineConfig({
  // plugins,
  build: {
    lib: {
      entry: path.resolve(__dirname, "lib"),
      name: "JRenderExtends",
      formats: ["es", "umd"],
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
        plugins: [babel],
      },
    },
  },
});

export default config;
