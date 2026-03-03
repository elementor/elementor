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
export {
  generateId,
  getSelectorWithState,
  getStylesSchema,
  getVariantByMeta,
  isClassState,
  isExistingStyleProperty,
  isPseudoState
};
//# sourceMappingURL=index.mjs.map