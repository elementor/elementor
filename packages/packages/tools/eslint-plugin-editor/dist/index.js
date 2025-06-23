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
  meta: () => meta,
  rules: () => rules
});
module.exports = __toCommonJS(index_exports);

// src/rules/no-react-namespace.ts
var import_utils = require("@typescript-eslint/utils");
var noReactNamespace = import_utils.ESLintUtils.RuleCreator.withoutDocs({
  meta: {
    type: "layout",
    docs: {
      description: "Disallow using `React.useHook`."
    },
    messages: {
      noReactNamespace: "Do not use `React.{{hookName}}`. Import the hook directly."
    },
    schema: []
  },
  defaultOptions: [],
  create(context) {
    return {
      'CallExpression[callee.object.name="React"][callee.property.name=/use[A-Z]/]'(node) {
        context.report({
          node,
          messageId: "noReactNamespace",
          data: {
            hookName: node.callee.property.name
          }
        });
      }
    };
  }
});

// src/index.ts
var meta = {
  name: "@elementor/eslint-plugin-editor",
  version: "0.0.0"
};
var rules = {
  "no-react-namespace": noReactNamespace
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  meta,
  rules
});
