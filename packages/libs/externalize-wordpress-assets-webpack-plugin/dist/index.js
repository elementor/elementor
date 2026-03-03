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
  ExternalizeWordPressAssetsWebpackPlugin: () => ExternalizeWordPressAssetsWebpackPlugin
});
module.exports = __toCommonJS(index_exports);

// src/plugin.ts
var import_webpack = require("webpack");

// src/utils.ts
function transformRequestToGlobal(request, map) {
  if (!request) {
    return null;
  }
  for (const item of map) {
    let { request: requestRegex, global } = item;
    if (!(requestRegex instanceof RegExp)) {
      requestRegex = new RegExp(`^${requestRegex}$`);
    }
    const matches = request.match(requestRegex);
    if (matches) {
      return replaceGlobal(global, matches);
    }
  }
  return null;
}
function replaceGlobal(global, matches) {
  let result = typeof global === "string" ? [global] : [...global];
  matches.forEach((value, index) => {
    result = result.map((item) => item.replace(`$${index}`, kebabToCamelCase(value)));
  });
  return result;
}
function kebabToCamelCase(kebabCase) {
  return kebabCase.replace(/-(\w)/g, (_, w) => w.toUpperCase());
}

// src/plugin.ts
var ExternalizeWordPressAssetsWebpackPlugin = class {
  options;
  externalPlugin;
  constructor(options) {
    this.options = {
      map: options.map,
      global: options.global,
      type: "window"
    };
    this.externalPlugin = new import_webpack.ExternalsPlugin(
      this.options.type,
      ({ request }, callback) => this.externalsPluginCallback(request, callback)
    );
  }
  apply(compiler) {
    this.externalPlugin.apply(compiler);
    compiler.hooks.environment.tap(this.constructor.name, () => {
      this.exposeEntry(compiler);
    });
  }
  externalsPluginCallback(request, callback) {
    const global = transformRequestToGlobal(request, this.options.map);
    if (!global) {
      callback();
      return;
    }
    callback(void 0, global);
  }
  exposeEntry(compiler) {
    compiler.options.output.enabledLibraryTypes?.push(this.options.type);
    const transformEntryNameToGlobal = this.options.global;
    const entry = compiler.options.entry;
    if (!transformEntryNameToGlobal) {
      return;
    }
    compiler.options.entry = Object.entries(entry).reduce(
      (carry, [name, entryItem]) => ({
        ...carry,
        [name]: {
          ...entryItem,
          library: {
            name: transformEntryNameToGlobal(kebabToCamelCase(name)),
            type: this.options.type
          }
        }
      }),
      {}
    );
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ExternalizeWordPressAssetsWebpackPlugin
});
//# sourceMappingURL=index.js.map