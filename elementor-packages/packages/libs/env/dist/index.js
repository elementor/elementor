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
  InvalidEnvError: () => InvalidEnvError,
  __resetEnv: () => __resetEnv,
  initEnv: () => initEnv,
  parseEnv: () => parseEnv
});
module.exports = __toCommonJS(index_exports);
var globalEnv = null;
function initEnv(env) {
  globalEnv = env;
}
function __resetEnv() {
  globalEnv = null;
}
function parseEnv(key, parseFn = (rawSettings) => rawSettings) {
  let parsedEnv = {};
  let isParsed = false;
  const proxiedEnv = new Proxy(parsedEnv, {
    get(target, property) {
      if (!isParsed) {
        parse();
      }
      return parsedEnv[property];
    },
    ownKeys() {
      if (!isParsed) {
        parse();
      }
      return Reflect.ownKeys(parsedEnv);
    },
    getOwnPropertyDescriptor() {
      return {
        configurable: true,
        enumerable: true
      };
    }
  });
  const parse = () => {
    try {
      const env = globalEnv?.[key];
      if (!env) {
        throw new InvalidEnvError(`Settings object not found`);
      }
      if (typeof env !== "object") {
        throw new InvalidEnvError(`Expected settings to be \`object\`, but got \`${typeof env}\``);
      }
      parsedEnv = parseFn(env);
    } catch (e) {
      if (e instanceof InvalidEnvError) {
        console.warn(`${key} - ${e.message}`);
        parsedEnv = {};
      } else {
        throw e;
      }
    } finally {
      isParsed = true;
    }
  };
  return {
    validateEnv: parse,
    env: proxiedEnv
  };
}
var InvalidEnvError = class extends Error {
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  InvalidEnvError,
  __resetEnv,
  initEnv,
  parseEnv
});
//# sourceMappingURL=index.js.map