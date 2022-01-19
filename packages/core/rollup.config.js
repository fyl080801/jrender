const { rollups } = require("../../build");
const { typescript } = require("../../build/rollup.plugins");
const { path } = require("../../build/utils");

const configs = {
  types: ["umd", "iife", "esm"],
  external: [],
  plugins: [
    ...rollups.defaultPlugins,
    typescript({
      tsconfig: path.resolve(__dirname, "tsconfig.json"),
    }),
  ],
};

export default (() => {
  const entries = {};

  entries["JRender"] = "./lib/index.ts";

  const result = rollups.establish(entries, configs);

  return result;
})();