"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  EntryInitializationWebpackPlugin: () => EntryInitializationWebpackPlugin
});
module.exports = __toCommonJS(index_exports);

// src/plugin.ts
var import_webpack = require("webpack");

// src/kebab-to-camel-case.ts
function kebabToCamelCase(kebabCase) {
  return kebabCase.replace(/-(\w)/g, (_, w) => w.toUpperCase());
}

// src/plugin.ts
var EntryInitializationWebpackPlugin = class {
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
    new import_webpack.BannerPlugin({
      banner: (args) => {
        const { name } = args.chunk;
        if (!name) {
          return "";
        }
        if (!/\.js$/.test(args.filename)) {
          return "";
        }
        return this.options.initializer({
          ...args,
          entryName: kebabToCamelCase(name)
        });
      },
      raw: true,
      footer: true,
      entryOnly: true,
      stage: import_webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS
    }).apply(compiler);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  EntryInitializationWebpackPlugin
});
//# sourceMappingURL=index.js.map