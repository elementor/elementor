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
  generateId: () => generateId,
  getSelectorWithState: () => getSelectorWithState,
  getStylesSchema: () => getStylesSchema,
  getVariantByMeta: () => getVariantByMeta,
  isClassState: () => isClassState,
  isExistingStyleProperty: () => isExistingStyleProperty,
  isPseudoState: () => isPseudoState
});
module.exports = __toCommonJS(index_exports);

// src/utils/generate-id.ts
function generateId(prefix = "", existingIds = []) {
  let id;
  do {
    id = prefix + Math.random().toString(16).slice(2, 9);
  } while (existingIds.includes(id));
  return id;
}

// src/utils/get-styles-schema.ts
var getElementorConfig = () => {
  const extendedWindow = window;
  return extendedWindow.elementor?.config ?? {};
};
var getStylesSchema = () => {
  const config = getElementorConfig();
  const styleSchema = config?.atomic?.styles_schema ?? {};
  return styleSchema;
};
var isExistingStyleProperty = (property) => {
  const stylesSchema = getStylesSchema();
  return Object.keys(stylesSchema).includes(property);
};

// src/utils/get-variant-by-meta.ts
function getVariantByMeta(style, meta) {
  return style.variants.find((variant) => {
    return variant.meta.breakpoint === meta.breakpoint && variant.meta.state === meta.state;
  });
}

// src/utils/state-utils.ts
var PSEUDO_STATES = ["hover", "focus", "active", "focus-visible"];
var CLASS_STATES = ["e--selected"];
function getAdditionalStates(state) {
  if (state === "hover") {
    return ["focus-visible"];
  }
  return [];
}
function getStateSelector(state) {
  if (isClassState(state)) {
    return `.${state}`;
  }
  if (isPseudoState(state)) {
    return `:${state}`;
  }
  return state;
}
function isClassState(state) {
  return CLASS_STATES.includes(state);
}
function isPseudoState(state) {
  return PSEUDO_STATES.includes(state);
}
function getSelectorWithState(baseSelector, state) {
  if (!state) {
    return baseSelector;
  }
  return [state, ...getAdditionalStates(state)].map((currentState) => `${baseSelector}${getStateSelector(currentState)}`).join(",");
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  generateId,
  getSelectorWithState,
  getStylesSchema,
  getVariantByMeta,
  isClassState,
  isExistingStyleProperty,
  isPseudoState
});
//# sourceMappingURL=index.js.map