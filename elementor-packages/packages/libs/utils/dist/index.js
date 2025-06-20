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
  ElementorError: () => ElementorError,
  createError: () => createError,
  debounce: () => debounce,
  ensureError: () => ensureError
});
module.exports = __toCommonJS(index_exports);

// src/errors/elementor-error.ts
var ElementorError = class extends Error {
  context;
  code;
  constructor(message, { code, context = null, cause = null }) {
    super(message, { cause });
    this.context = context;
    this.code = code;
  }
};

// src/errors/create-error.ts
var createError = ({ code, message }) => {
  return class extends ElementorError {
    constructor({ cause, context } = {}) {
      super(message, { cause, code, context });
    }
  };
};

// src/errors/ensure-error.ts
var ensureError = (error) => {
  if (error instanceof Error) {
    return error;
  }
  let message;
  let cause = null;
  try {
    message = JSON.stringify(error);
  } catch (e) {
    cause = e;
    message = "Unable to stringify the thrown value";
  }
  return new Error(`Unexpected non-error thrown: ${message}`, { cause });
};

// src/debounce.ts
function debounce(fn, wait) {
  let timer = null;
  const cancel = () => {
    if (!timer) {
      return;
    }
    clearTimeout(timer);
    timer = null;
  };
  const flush = (...args) => {
    cancel();
    fn(...args);
  };
  const run = (...args) => {
    cancel();
    timer = setTimeout(() => {
      fn(...args);
      timer = null;
    }, wait);
  };
  const pending = () => !!timer;
  run.flush = flush;
  run.cancel = cancel;
  run.pending = pending;
  return run;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ElementorError,
  createError,
  debounce,
  ensureError
});
//# sourceMappingURL=index.js.map