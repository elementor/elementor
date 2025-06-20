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

// src/utils/get-variant-by-meta.ts
function getVariantByMeta(style, meta) {
  return style.variants.find((variant) => {
    return variant.meta.breakpoint === meta.breakpoint && variant.meta.state === meta.state;
  });
}
export {
  generateId,
  getStylesSchema,
  getVariantByMeta
};
//# sourceMappingURL=index.mjs.map