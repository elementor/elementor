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
  CLASSES_PROP_KEY: () => CLASSES_PROP_KEY,
  backgroundColorOverlayPropTypeUtil: () => backgroundColorOverlayPropTypeUtil,
  backgroundGradientOverlayPropTypeUtil: () => backgroundGradientOverlayPropTypeUtil,
  backgroundImageOverlayPropTypeUtil: () => backgroundImageOverlayPropTypeUtil,
  backgroundImagePositionOffsetPropTypeUtil: () => backgroundImagePositionOffsetPropTypeUtil,
  backgroundImageSizeScalePropTypeUtil: () => backgroundImageSizeScalePropTypeUtil,
  backgroundOverlayPropTypeUtil: () => backgroundOverlayPropTypeUtil,
  backgroundPropTypeUtil: () => backgroundPropTypeUtil,
  blurFilterPropTypeUtil: () => blurFilterPropTypeUtil,
  booleanPropTypeUtil: () => booleanPropTypeUtil,
  borderRadiusPropTypeUtil: () => borderRadiusPropTypeUtil,
  borderWidthPropTypeUtil: () => borderWidthPropTypeUtil,
  boxShadowPropTypeUtil: () => boxShadowPropTypeUtil,
  brightnessFilterPropTypeUtil: () => brightnessFilterPropTypeUtil,
  classesPropTypeUtil: () => classesPropTypeUtil,
  colorPropTypeUtil: () => colorPropTypeUtil,
  colorStopPropTypeUtil: () => colorStopPropTypeUtil,
  createArrayPropUtils: () => createArrayPropUtils,
  createPropUtils: () => createPropUtils,
  dimensionsPropTypeUtil: () => dimensionsPropTypeUtil,
  evaluateTerm: () => evaluateTerm,
  filterEmptyValues: () => filterEmptyValues,
  filterPropTypeUtil: () => filterPropTypeUtil,
  gradientColorStopPropTypeUtil: () => gradientColorStopPropTypeUtil,
  imageAttachmentIdPropType: () => imageAttachmentIdPropType,
  imagePropTypeUtil: () => imagePropTypeUtil,
  imageSrcPropTypeUtil: () => imageSrcPropTypeUtil,
  isEmpty: () => isEmpty,
  isTransformable: () => isTransformable,
  keyValuePropTypeUtil: () => keyValuePropTypeUtil,
  layoutDirectionPropTypeUtil: () => layoutDirectionPropTypeUtil,
  linkPropTypeUtil: () => linkPropTypeUtil,
  mergeProps: () => mergeProps,
  numberPropTypeUtil: () => numberPropTypeUtil,
  positionPropTypeUtil: () => positionPropTypeUtil,
  shadowPropTypeUtil: () => shadowPropTypeUtil,
  shouldApplyEffect: () => shouldApplyEffect,
  sizePropTypeUtil: () => sizePropTypeUtil,
  stringPropTypeUtil: () => stringPropTypeUtil,
  strokePropTypeUtil: () => strokePropTypeUtil,
  urlPropTypeUtil: () => urlPropTypeUtil
});
module.exports = __toCommonJS(index_exports);

// src/prop-types/box-shadow.ts
var import_schema4 = require("@elementor/schema");

// src/utils/create-prop-utils.ts
var import_schema = require("@elementor/schema");
function createPropUtils(key, valueSchema) {
  const schema = import_schema.z.strictObject({
    $$type: import_schema.z.literal(key),
    value: valueSchema,
    disabled: import_schema.z.boolean().optional()
  });
  function isValid(prop) {
    return schema.safeParse(prop).success;
  }
  function create(value, createOptions) {
    const fn = typeof value === "function" ? value : () => value;
    const { base, disabled } = createOptions || {};
    if (!base) {
      return {
        $$type: key,
        value: fn(),
        ...disabled && { disabled }
      };
    }
    if (!isValid(base)) {
      throw new Error(`Cannot create prop based on invalid value: ${JSON.stringify(base)}`);
    }
    return {
      $$type: key,
      value: fn(base.value),
      ...disabled && { disabled }
    };
  }
  function extract(prop) {
    if (!isValid(prop)) {
      return null;
    }
    return prop.value;
  }
  return {
    extract,
    isValid,
    create,
    schema,
    key
  };
}
function createArrayPropUtils(key, valueSchema) {
  return createPropUtils(`${key}-array`, import_schema.z.array(valueSchema));
}

// src/prop-types/shadow.ts
var import_schema3 = require("@elementor/schema");

// src/prop-types/utils.ts
var import_schema2 = require("@elementor/schema");
var unknownChildrenSchema = import_schema2.z.any().nullable();

// src/prop-types/shadow.ts
var shadowPropTypeUtil = createPropUtils(
  "shadow",
  import_schema3.z.strictObject({
    position: unknownChildrenSchema,
    hOffset: unknownChildrenSchema,
    vOffset: unknownChildrenSchema,
    blur: unknownChildrenSchema,
    spread: unknownChildrenSchema,
    color: unknownChildrenSchema
  })
);

// src/prop-types/box-shadow.ts
var boxShadowPropTypeUtil = createPropUtils("box-shadow", import_schema4.z.array(shadowPropTypeUtil.schema));

// src/prop-types/border-radius.ts
var import_schema5 = require("@elementor/schema");
var borderRadiusPropTypeUtil = createPropUtils(
  "border-radius",
  import_schema5.z.strictObject({
    "start-start": unknownChildrenSchema,
    "start-end": unknownChildrenSchema,
    "end-start": unknownChildrenSchema,
    "end-end": unknownChildrenSchema
  })
);

// src/prop-types/border-width.ts
var import_schema6 = require("@elementor/schema");
var borderWidthPropTypeUtil = createPropUtils(
  "border-width",
  import_schema6.z.strictObject({
    "block-start": unknownChildrenSchema,
    "block-end": unknownChildrenSchema,
    "inline-start": unknownChildrenSchema,
    "inline-end": unknownChildrenSchema
  })
);

// src/prop-types/classes.ts
var import_schema7 = require("@elementor/schema");
var CLASSES_PROP_KEY = "classes";
var classesPropTypeUtil = createPropUtils(
  CLASSES_PROP_KEY,
  import_schema7.z.array(import_schema7.z.string().regex(/^[a-z][a-z-_0-9]*$/i))
);

// src/prop-types/color.ts
var import_schema8 = require("@elementor/schema");
var colorPropTypeUtil = createPropUtils("color", import_schema8.z.string());

// src/prop-types/image.ts
var import_schema9 = require("@elementor/schema");
var imagePropTypeUtil = createPropUtils(
  "image",
  import_schema9.z.strictObject({
    src: unknownChildrenSchema,
    size: unknownChildrenSchema
  })
);

// src/prop-types/image-attachment-id.ts
var import_schema10 = require("@elementor/schema");
var imageAttachmentIdPropType = createPropUtils("image-attachment-id", import_schema10.z.number());

// src/prop-types/image-src.ts
var import_schema11 = require("@elementor/schema");
var imageSrcPropTypeUtil = createPropUtils(
  "image-src",
  import_schema11.z.strictObject({
    id: unknownChildrenSchema,
    url: import_schema11.z.null()
  }).or(
    import_schema11.z.strictObject({
      id: import_schema11.z.null(),
      url: unknownChildrenSchema
    })
  )
);

// src/prop-types/dimensions.ts
var import_schema12 = require("@elementor/schema");
var dimensionsPropTypeUtil = createPropUtils(
  "dimensions",
  import_schema12.z.strictObject({
    "block-start": unknownChildrenSchema,
    "block-end": unknownChildrenSchema,
    "inline-start": unknownChildrenSchema,
    "inline-end": unknownChildrenSchema
  })
);

// src/prop-types/number.ts
var import_schema13 = require("@elementor/schema");
var numberPropTypeUtil = createPropUtils("number", import_schema13.z.number().nullable());

// src/prop-types/size.ts
var import_schema14 = require("@elementor/schema");
var sizePropTypeUtil = createPropUtils(
  "size",
  import_schema14.z.strictObject({
    unit: import_schema14.z.enum(["px", "em", "rem", "%", "vw", "vh"]),
    size: import_schema14.z.number()
  }).or(
    import_schema14.z.strictObject({
      unit: import_schema14.z.literal("auto"),
      size: import_schema14.z.literal("")
    })
  ).or(
    import_schema14.z.strictObject({
      unit: import_schema14.z.literal("custom"),
      size: import_schema14.z.string()
    })
  )
);

// src/prop-types/string.ts
var import_schema15 = require("@elementor/schema");
var stringPropTypeUtil = createPropUtils("string", import_schema15.z.string().nullable());

// src/prop-types/stroke.ts
var import_schema16 = require("@elementor/schema");
var strokePropTypeUtil = createPropUtils(
  "stroke",
  import_schema16.z.strictObject({
    color: unknownChildrenSchema,
    width: unknownChildrenSchema
  })
);

// src/prop-types/url.ts
var import_schema17 = require("@elementor/schema");
var urlPropTypeUtil = createPropUtils("url", import_schema17.z.string().nullable());

// src/prop-types/layout-direction.ts
var import_schema18 = require("@elementor/schema");
var layoutDirectionPropTypeUtil = createPropUtils(
  "layout-direction",
  import_schema18.z.object({
    row: import_schema18.z.any(),
    column: import_schema18.z.any()
  })
);

// src/prop-types/link.ts
var import_schema19 = require("@elementor/schema");
var linkPropTypeUtil = createPropUtils(
  "link",
  import_schema19.z.strictObject({
    destination: unknownChildrenSchema,
    label: unknownChildrenSchema,
    isTargetBlank: unknownChildrenSchema
  })
);

// src/prop-types/background-prop-types/background.ts
var import_schema20 = require("@elementor/schema");
var backgroundPropTypeUtil = createPropUtils(
  "background",
  import_schema20.z.strictObject({
    color: unknownChildrenSchema,
    "background-overlay": unknownChildrenSchema
  })
);

// src/prop-types/background-prop-types/background-overlay.ts
var import_schema21 = require("@elementor/schema");

// src/prop-types/background-prop-types/background-color-overlay.ts
var backgroundColorOverlayPropTypeUtil = createPropUtils("background-color-overlay", unknownChildrenSchema);

// src/prop-types/background-prop-types/background-gradient-overlay.ts
var backgroundGradientOverlayPropTypeUtil = createPropUtils(
  "background-gradient-overlay",
  unknownChildrenSchema
);

// src/prop-types/background-prop-types/background-image-overlay.ts
var backgroundImageOverlayPropTypeUtil = createPropUtils("background-image-overlay", unknownChildrenSchema);

// src/prop-types/background-prop-types/background-overlay.ts
var backgroundOverlayItem = backgroundColorOverlayPropTypeUtil.schema.or(backgroundGradientOverlayPropTypeUtil.schema).or(backgroundImageOverlayPropTypeUtil.schema);
var backgroundOverlayPropTypeUtil = createPropUtils("background-overlay", import_schema21.z.array(backgroundOverlayItem));

// src/prop-types/background-prop-types/background-image-position-offset.ts
var backgroundImagePositionOffsetPropTypeUtil = createPropUtils(
  "background-image-position-offset",
  unknownChildrenSchema
);

// src/prop-types/background-prop-types/background-image-size-scale.ts
var backgroundImageSizeScalePropTypeUtil = createPropUtils(
  "background-image-size-scale",
  unknownChildrenSchema
);

// src/prop-types/boolean.ts
var import_schema22 = require("@elementor/schema");
var booleanPropTypeUtil = createPropUtils("boolean", import_schema22.z.boolean().nullable());

// src/prop-types/color-stop.ts
var import_schema23 = require("@elementor/schema");
var colorStopPropTypeUtil = createPropUtils(
  "color-stop",
  import_schema23.z.strictObject({
    color: unknownChildrenSchema,
    offset: unknownChildrenSchema
  })
);

// src/prop-types/gradient-color-stop.ts
var import_schema24 = require("@elementor/schema");
var gradientColorStopPropTypeUtil = createPropUtils(
  "gradient-color-stop",
  import_schema24.z.array(colorStopPropTypeUtil.schema)
);

// src/prop-types/key-value.ts
var import_schema25 = require("@elementor/schema");
var keyValuePropTypeUtil = createPropUtils(
  "key-value",
  import_schema25.z.strictObject({
    key: unknownChildrenSchema,
    value: unknownChildrenSchema
  })
);

// src/prop-types/position.ts
var import_schema26 = require("@elementor/schema");
var positionPropTypeUtil = createPropUtils(
  "object-position",
  import_schema26.z.strictObject({
    x: sizePropTypeUtil.schema.nullable(),
    y: sizePropTypeUtil.schema.nullable()
  })
);

// src/prop-types/filter-prop-types/filter.ts
var import_schema27 = require("@elementor/schema");

// src/prop-types/filter-prop-types/blur-filter.ts
var blurFilterPropTypeUtil = createPropUtils("blur", unknownChildrenSchema);

// src/prop-types/filter-prop-types/brightness-filter.ts
var brightnessFilterPropTypeUtil = createPropUtils("brightness", unknownChildrenSchema);

// src/prop-types/filter-prop-types/filter.ts
var filterTypes = blurFilterPropTypeUtil.schema.or(brightnessFilterPropTypeUtil.schema);
var filterPropTypeUtil = createPropUtils("filter", import_schema27.z.array(filterTypes));

// src/utils/merge-props.ts
function mergeProps(current, updates) {
  const props = structuredClone(current);
  Object.entries(updates).forEach(([key, value]) => {
    if (value === null || value === void 0) {
      delete props[key];
    } else {
      props[key] = value;
    }
  });
  return props;
}

// src/utils/prop-dependency-utils.ts
function shouldApplyEffect({ relation, terms }, values) {
  if (!terms.length) {
    return false;
  }
  const method = getRelationMethod(relation);
  return terms[method](
    (term) => isDependency(term) ? shouldApplyEffect(term, values) : evaluateTerm(term, getValue(term.path, values))
  );
}
function evaluateTerm(term, actualValue) {
  const { value: valueToCompare, operator } = term;
  switch (operator) {
    case "eq":
    case "ne":
      return actualValue === valueToCompare === ("eq" === operator);
    case "gt":
    case "lte":
      if (isNaN(Number(actualValue)) || isNaN(Number(valueToCompare))) {
        throw new Error("Mathematical comparison requires numeric values.");
      }
      return Number(actualValue) > Number(valueToCompare) === ("gt" === operator);
    case "lt":
    case "gte":
      if (isNaN(Number(actualValue)) || isNaN(Number(valueToCompare))) {
        throw new Error("Mathematical comparison requires numeric values.");
      }
      return Number(actualValue) < Number(valueToCompare) === ("lt" === operator);
    case "in":
    case "nin":
      if (!Array.isArray(valueToCompare)) {
        throw new Error('The "in" and "nin" operators require an array for comparison.');
      }
      return valueToCompare.includes(actualValue) === ("in" === operator);
    case "contains":
    case "ncontains":
      if (("string" !== typeof actualValue || "string" !== typeof valueToCompare) && !Array.isArray(actualValue)) {
        throw new Error(
          'The "contains" and "ncontains" operators require a string or an array for comparison.'
        );
      }
      return "contains" === operator === actualValue.includes(valueToCompare);
    case "exists":
    case "not_exist":
      const evaluation = !!actualValue || 0 === actualValue || false === actualValue;
      return "exists" === operator === evaluation;
    default:
      return false;
  }
}
function getRelationMethod(relation) {
  switch (relation) {
    case "or":
      return "some";
    case "and":
      return "every";
    default:
      throw new Error(`Relation not supported ${relation}`);
  }
}
function getValue(path, elementValues) {
  return path.reduce((acc, key) => {
    return "object" === typeof acc && acc !== null && key in acc ? acc[key]?.value : null;
  }, elementValues);
}
function isDependency(term) {
  return "relation" in term;
}

// src/utils/is-transformable.ts
var import_schema28 = require("@elementor/schema");
var transformableSchema = import_schema28.z.object({
  $$type: import_schema28.z.string(),
  value: import_schema28.z.any(),
  disabled: import_schema28.z.boolean().optional()
});
var isTransformable = (value) => {
  return transformableSchema.safeParse(value).success;
};

// src/utils/filter-empty-values.ts
var filterEmptyValues = (value) => {
  if (isEmpty(value)) {
    return null;
  }
  if (Array.isArray(value)) {
    return value.map(filterEmptyValues).filter((item) => !isEmpty(item));
  }
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [key, filterEmptyValues(val)]).filter(([, val]) => !isEmpty(val))
    );
  }
  return value;
};
var isEmpty = (value) => {
  if (value && isTransformable(value)) {
    return isEmpty(value.value);
  }
  return isNullish(value) || isNullishArray(value) || isNullishObject(value);
};
var isNullish = (value) => value === null || value === void 0 || value === "";
var isNullishArray = (value) => Array.isArray(value) && value.every(isEmpty);
var isNullishObject = (value) => {
  return typeof value === "object" && isNullishArray(Object.values(value));
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CLASSES_PROP_KEY,
  backgroundColorOverlayPropTypeUtil,
  backgroundGradientOverlayPropTypeUtil,
  backgroundImageOverlayPropTypeUtil,
  backgroundImagePositionOffsetPropTypeUtil,
  backgroundImageSizeScalePropTypeUtil,
  backgroundOverlayPropTypeUtil,
  backgroundPropTypeUtil,
  blurFilterPropTypeUtil,
  booleanPropTypeUtil,
  borderRadiusPropTypeUtil,
  borderWidthPropTypeUtil,
  boxShadowPropTypeUtil,
  brightnessFilterPropTypeUtil,
  classesPropTypeUtil,
  colorPropTypeUtil,
  colorStopPropTypeUtil,
  createArrayPropUtils,
  createPropUtils,
  dimensionsPropTypeUtil,
  evaluateTerm,
  filterEmptyValues,
  filterPropTypeUtil,
  gradientColorStopPropTypeUtil,
  imageAttachmentIdPropType,
  imagePropTypeUtil,
  imageSrcPropTypeUtil,
  isEmpty,
  isTransformable,
  keyValuePropTypeUtil,
  layoutDirectionPropTypeUtil,
  linkPropTypeUtil,
  mergeProps,
  numberPropTypeUtil,
  positionPropTypeUtil,
  shadowPropTypeUtil,
  shouldApplyEffect,
  sizePropTypeUtil,
  stringPropTypeUtil,
  strokePropTypeUtil,
  urlPropTypeUtil
});
//# sourceMappingURL=index.js.map