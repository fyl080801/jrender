// import path from "path";
// import fs from "fs";
import { defineConfig } from "vite";
import { plugins } from "./vite.plugin";

// const packages = fs.readdirSync(path.resolve(__dirname, "../packages")).reduce((target, p) => {
//   target[`@jrender/${p}`] = path.resolve(__dirname, `../packages/${p}/lib`);
//   return target;
// }, {});

const config = defineConfig({
  //   resolve: {
  //     alias: {
  //       "@": path.resolve(__dirname, "src"),
  //       ...packages,
  //     },
  //     dedupe: ["vue-demi"],
  //   },
  build: {
    minify: true,
  },
  plugins,
  //   server: {
  //     port: 8080,
  //   },
});

export default config;
