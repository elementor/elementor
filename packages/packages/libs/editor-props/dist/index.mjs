// src/prop-types/box-shadow.ts
import { z as z4 } from "@elementor/schema";

// src/utils/create-prop-utils.ts
import { z } from "@elementor/schema";
var SCHEMA_CACHE = /* @__PURE__ */ new Map();
function getPropSchemaFromCache(key) {
  return SCHEMA_CACHE.get(key);
}
function createPropUtils(key, valueSchema) {
  const schema = z.strictObject({
    $$type: z.literal(key),
    value: valueSchema,
    disabled: z.boolean().optional()
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
  const propUtil = {
    extract,
    isValid,
    create,
    schema,
    key
  };
  SCHEMA_CACHE.set(key, propUtil);
  return propUtil;
}
function createArrayPropUtils(key, valueSchema, overrideKey) {
  return createPropUtils(overrideKey || `${key}-array`, z.array(valueSchema));
}

// src/prop-types/shadow.ts
import { z as z3 } from "@elementor/schema";

// src/prop-types/utils.ts
import { z as z2 } from "@elementor/schema";
var unknownChildrenSchema = z2.any().nullable();

// src/prop-types/shadow.ts
var shadowPropTypeUtil = createPropUtils(
  "shadow",
  z3.strictObject({
    position: unknownChildrenSchema,
    hOffset: unknownChildrenSchema,
    vOffset: unknownChildrenSchema,
    blur: unknownChildrenSchema,
    spread: unknownChildrenSchema,
    color: unknownChildrenSchema
  })
);

// src/prop-types/box-shadow.ts
var boxShadowPropTypeUtil = createPropUtils("box-shadow", z4.array(shadowPropTypeUtil.schema));

// src/prop-types/border-radius.ts
import { z as z5 } from "@elementor/schema";
var borderRadiusPropTypeUtil = createPropUtils(
  "border-radius",
  z5.strictObject({
    "start-start": unknownChildrenSchema,
    "start-end": unknownChildrenSchema,
    "end-start": unknownChildrenSchema,
    "end-end": unknownChildrenSchema
  })
);

// src/prop-types/border-width.ts
import { z as z6 } from "@elementor/schema";
var borderWidthPropTypeUtil = createPropUtils(
  "border-width",
  z6.strictObject({
    "block-start": unknownChildrenSchema,
    "block-end": unknownChildrenSchema,
    "inline-start": unknownChildrenSchema,
    "inline-end": unknownChildrenSchema
  })
);

// src/prop-types/classes.ts
import { z as z7 } from "@elementor/schema";
var CLASSES_PROP_KEY = "classes";
var classesPropTypeUtil = createPropUtils(
  CLASSES_PROP_KEY,
  z7.array(z7.string().regex(/^[a-z][a-z-_0-9]*$/i))
);

// src/prop-types/color.ts
import { z as z8 } from "@elementor/schema";
var colorPropTypeUtil = createPropUtils("color", z8.string());

// src/prop-types/flex.ts
import { z as z9 } from "@elementor/schema";
var flexPropTypeUtil = createPropUtils(
  "flex",
  z9.strictObject({
    flexGrow: unknownChildrenSchema,
    flexShrink: unknownChildrenSchema,
    flexBasis: unknownChildrenSchema
  })
);

// src/prop-types/image.ts
import { z as z10 } from "@elementor/schema";
var imagePropTypeUtil = createPropUtils(
  "image",
  z10.strictObject({
    src: unknownChildrenSchema,
    size: unknownChildrenSchema
  })
);

// src/prop-types/image-attachment-id.ts
import { z as z11 } from "@elementor/schema";
var imageAttachmentIdPropType = createPropUtils("image-attachment-id", z11.number());

// src/prop-types/image-src.ts
import { z as z12 } from "@elementor/schema";
var imageSrcPropTypeUtil = createPropUtils(
  "image-src",
  z12.strictObject({
    id: unknownChildrenSchema,
    url: z12.null()
  }).or(
    z12.strictObject({
      id: z12.null(),
      url: unknownChildrenSchema
    })
  )
);

// src/prop-types/video-attachment-id.ts
import { z as z13 } from "@elementor/schema";
var videoAttachmentIdPropType = createPropUtils("video-attachment-id", z13.number());

// src/prop-types/video-src.ts
import { z as z14 } from "@elementor/schema";
var videoSrcPropTypeUtil = createPropUtils(
  "video-src",
  z14.strictObject({
    id: unknownChildrenSchema,
    url: z14.null()
  }).or(
    z14.strictObject({
      id: z14.null(),
      url: unknownChildrenSchema
    })
  )
);

// src/prop-types/dimensions.ts
import { z as z15 } from "@elementor/schema";
var dimensionsPropTypeUtil = createPropUtils(
  "dimensions",
  z15.strictObject({
    "block-start": unknownChildrenSchema,
    "block-end": unknownChildrenSchema,
    "inline-start": unknownChildrenSchema,
    "inline-end": unknownChildrenSchema
  })
);

// src/prop-types/number.ts
import { z as z16 } from "@elementor/schema";
var numberPropTypeUtil = createPropUtils("number", z16.number().nullable());

// src/prop-types/size.ts
import { z as z17 } from "@elementor/schema";
var sizePropTypeUtil = createPropUtils(
  "size",
  z17.strictObject({
    unit: z17.enum(["px", "em", "rem", "%", "vw", "vh", "ch"]),
    size: z17.number()
  }).or(
    z17.strictObject({
      unit: z17.enum(["deg", "rad", "grad", "turn"]),
      size: z17.number()
    })
  ).or(
    z17.strictObject({
      unit: z17.enum(["s", "ms"]),
      size: z17.number()
    })
  ).or(
    z17.strictObject({
      unit: z17.literal("auto"),
      size: z17.literal("")
    })
  ).or(
    z17.strictObject({
      unit: z17.literal("custom"),
      size: z17.string()
    })
  )
);

// src/prop-types/string.ts
import { z as z18 } from "@elementor/schema";
var stringPropTypeUtil = createPropUtils("string", z18.string().nullable());

// src/prop-types/string-array.ts
var stringArrayPropTypeUtil = createArrayPropUtils(stringPropTypeUtil.key, stringPropTypeUtil.schema);

// src/prop-types/stroke.ts
import { z as z19 } from "@elementor/schema";
var strokePropTypeUtil = createPropUtils(
  "stroke",
  z19.strictObject({
    color: unknownChildrenSchema,
    width: unknownChildrenSchema
  })
);

// src/prop-types/url.ts
import { z as z20 } from "@elementor/schema";
var urlPropTypeUtil = createPropUtils("url", z20.string().nullable());

// src/prop-types/layout-direction.ts
import { z as z21 } from "@elementor/schema";
var layoutDirectionPropTypeUtil = createPropUtils(
  "layout-direction",
  z21.object({
    row: z21.any(),
    column: z21.any()
  })
);

// src/prop-types/link.ts
import { z as z22 } from "@elementor/schema";
var linkPropTypeUtil = createPropUtils(
  "link",
  z22.strictObject({
    destination: unknownChildrenSchema,
    isTargetBlank: unknownChildrenSchema,
    tag: unknownChildrenSchema
  })
);

// src/prop-types/email.ts
import { z as z23 } from "@elementor/schema";
var emailPropTypeUtil = createPropUtils(
  "email",
  z23.strictObject({
    to: unknownChildrenSchema,
    subject: unknownChildrenSchema,
    message: unknownChildrenSchema,
    from: unknownChildrenSchema,
    "meta-data": unknownChildrenSchema,
    "send-as": unknownChildrenSchema,
    "from-name": unknownChildrenSchema,
    "reply-to": unknownChildrenSchema,
    cc: unknownChildrenSchema,
    bcc: unknownChildrenSchema
  })
);

// src/prop-types/selection-size.ts
import { z as z25 } from "@elementor/schema";

// src/prop-types/key-value.ts
import { z as z24 } from "@elementor/schema";
var keyValuePropTypeUtil = createPropUtils(
  "key-value",
  z24.strictObject({
    key: unknownChildrenSchema,
    value: unknownChildrenSchema
  })
);

// src/prop-types/selection-size.ts
var selectionSizePropTypeUtil = createPropUtils(
  "selection-size",
  z25.strictObject({
    selection: z25.union([keyValuePropTypeUtil.schema, stringPropTypeUtil.schema]),
    size: unknownChildrenSchema
  })
);

// src/prop-types/background-prop-types/background.ts
import { z as z26 } from "@elementor/schema";
var backgroundPropTypeUtil = createPropUtils(
  "background",
  z26.strictObject({
    color: unknownChildrenSchema,
    clip: unknownChildrenSchema,
    "background-overlay": unknownChildrenSchema
  })
);

// src/prop-types/background-prop-types/background-overlay.ts
import { z as z27 } from "@elementor/schema";

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
var backgroundOverlayPropTypeUtil = createPropUtils("background-overlay", z27.array(backgroundOverlayItem));

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
import { z as z28 } from "@elementor/schema";
var booleanPropTypeUtil = createPropUtils("boolean", z28.boolean().nullable());

// src/prop-types/color-stop.ts
import { z as z29 } from "@elementor/schema";
var colorStopPropTypeUtil = createPropUtils(
  "color-stop",
  z29.strictObject({
    color: unknownChildrenSchema,
    offset: unknownChildrenSchema
  })
);

// src/prop-types/gradient-color-stop.ts
import { z as z30 } from "@elementor/schema";
var gradientColorStopPropTypeUtil = createPropUtils(
  "gradient-color-stop",
  z30.array(colorStopPropTypeUtil.schema)
);

// src/prop-types/date-time.ts
import { z as z31 } from "@elementor/schema";
var DateTimePropTypeUtil = createPropUtils(
  "date-time",
  z31.strictObject({
    date: unknownChildrenSchema,
    time: unknownChildrenSchema
  })
);

// src/prop-types/position.ts
import { z as z32 } from "@elementor/schema";
var positionPropTypeUtil = createPropUtils(
  "object-position",
  z32.strictObject({
    x: unknownChildrenSchema,
    y: unknownChildrenSchema
  })
);

// src/prop-types/query.ts
import { z as z33 } from "@elementor/schema";
var queryPropTypeUtil = createPropUtils(
  "query",
  z33.strictObject({
    id: unknownChildrenSchema,
    label: unknownChildrenSchema
  })
);

// src/prop-types/html.ts
import { z as z34 } from "@elementor/schema";
var htmlPropTypeUtil = createPropUtils("html", z34.string().nullable());

// src/prop-types/html-v2.ts
import { z as z35 } from "@elementor/schema";
var childElementSchema = z35.lazy(
  () => z35.object({
    id: z35.string(),
    type: z35.string(),
    content: z35.string().optional(),
    children: z35.array(childElementSchema).optional()
  })
);
var htmlV2ValueSchema = z35.object({
  content: z35.string().nullable(),
  children: z35.array(childElementSchema)
});
var htmlV2PropTypeUtil = createPropUtils("html-v2", htmlV2ValueSchema);

// src/prop-types/html-v3.ts
import { z as z36 } from "@elementor/schema";
var htmlV3ValueSchema = z36.object({
  content: stringPropTypeUtil.schema.nullable(),
  children: z36.array(z36.unknown())
});
var htmlV3PropTypeUtil = createPropUtils("html-v3", htmlV3ValueSchema);

// src/prop-types/filter-prop-types/filter.ts
import { z as z42 } from "@elementor/schema";

// src/prop-types/filter-prop-types/drop-shadow-filter.ts
import { z as z37 } from "@elementor/schema";
var dropShadowFilterPropTypeUtil = createPropUtils(
  "drop-shadow",
  z37.object({
    xAxis: unknownChildrenSchema,
    yAxis: unknownChildrenSchema,
    blur: unknownChildrenSchema,
    color: unknownChildrenSchema
  })
);

// src/prop-types/filter-prop-types/filter-functions/blur-filter.ts
import { z as z38 } from "@elementor/schema";
var blurFilterPropTypeUtil = createPropUtils(
  "blur",
  z38.strictObject({
    size: unknownChildrenSchema
  })
);

// src/prop-types/filter-prop-types/filter-functions/color-tone-filter.ts
import { z as z39 } from "@elementor/schema";
var colorToneFilterPropTypeUtil = createPropUtils(
  "color-tone",
  z39.strictObject({
    size: unknownChildrenSchema
  })
);

// src/prop-types/filter-prop-types/filter-functions/hue-rotate-filter.ts
import { z as z40 } from "@elementor/schema";
var hueRotateFilterPropTypeUtil = createPropUtils(
  "hue-rotate",
  z40.strictObject({
    size: unknownChildrenSchema
  })
);

// src/prop-types/filter-prop-types/filter-functions/intensity-filter.ts
import { z as z41 } from "@elementor/schema";
var intensityFilterPropTypeUtil = createPropUtils(
  "intensity",
  z41.strictObject({
    size: unknownChildrenSchema
  })
);

// src/prop-types/filter-prop-types/filter.ts
var cssFilterFunctionPropUtil = createPropUtils(
  "css-filter-func",
  z42.object({
    func: stringPropTypeUtil.schema,
    args: z42.union([
      blurFilterPropTypeUtil.schema,
      intensityFilterPropTypeUtil.schema,
      colorToneFilterPropTypeUtil.schema,
      hueRotateFilterPropTypeUtil.schema,
      dropShadowFilterPropTypeUtil.schema
    ])
  })
);
var filterPropTypeUtil = createPropUtils("filter", z42.array(cssFilterFunctionPropUtil.schema));

// src/prop-types/transform-prop-types/transform.ts
import { z as z43 } from "@elementor/schema";
var transformPropTypeUtil = createPropUtils(
  "transform",
  z43.strictObject({
    "transform-functions": unknownChildrenSchema,
    "transform-origin": unknownChildrenSchema,
    perspective: unknownChildrenSchema,
    "perspective-origin": unknownChildrenSchema
  })
);

// src/prop-types/transform-prop-types/transform-functions.ts
import { z as z48 } from "@elementor/schema";

// src/prop-types/transform-prop-types/transform-functions/move-transform.ts
import { z as z44 } from "@elementor/schema";

// src/prop-types/transform-prop-types/types.ts
var TransformFunctionKeys = {
  move: "transform-move",
  scale: "transform-scale",
  rotate: "transform-rotate",
  skew: "transform-skew"
};

// src/prop-types/transform-prop-types/transform-functions/move-transform.ts
var moveTransformPropTypeUtil = createPropUtils(
  TransformFunctionKeys.move,
  z44.strictObject({
    x: unknownChildrenSchema,
    y: unknownChildrenSchema,
    z: unknownChildrenSchema
  })
);

// src/prop-types/transform-prop-types/transform-functions/rotate-transform.ts
import { z as z45 } from "@elementor/schema";
var rotateTransformPropTypeUtil = createPropUtils(
  TransformFunctionKeys.rotate,
  z45.strictObject({
    x: unknownChildrenSchema,
    y: unknownChildrenSchema,
    z: unknownChildrenSchema
  })
);

// src/prop-types/transform-prop-types/transform-functions/scale-transform.ts
import { z as z46 } from "@elementor/schema";
var scaleTransformPropTypeUtil = createPropUtils(
  TransformFunctionKeys.scale,
  z46.strictObject({
    x: numberPropTypeUtil.schema.nullable(),
    y: numberPropTypeUtil.schema.nullable(),
    z: numberPropTypeUtil.schema.nullable()
  })
);

// src/prop-types/transform-prop-types/transform-functions/skew-transform.ts
import { z as z47 } from "@elementor/schema";
var skewTransformPropTypeUtil = createPropUtils(
  TransformFunctionKeys.skew,
  z47.strictObject({
    x: unknownChildrenSchema,
    y: unknownChildrenSchema
  })
);

// src/prop-types/transform-prop-types/transform-functions.ts
var filterTypes = moveTransformPropTypeUtil.schema.or(scaleTransformPropTypeUtil.schema).or(rotateTransformPropTypeUtil.schema).or(skewTransformPropTypeUtil.schema);
var transformFunctionsPropTypeUtil = createPropUtils("transform-functions", z48.array(filterTypes));

// src/prop-types/transform-prop-types/transform-origin.ts
import { z as z49 } from "@elementor/schema";
var transformOriginPropTypeUtil = createPropUtils(
  "transform-origin",
  z49.strictObject({
    x: unknownChildrenSchema,
    y: unknownChildrenSchema,
    z: unknownChildrenSchema
  })
);

// src/prop-types/transform-prop-types/perspective-origin.ts
import { z as z50 } from "@elementor/schema";
var perspectiveOriginPropTypeUtil = createPropUtils(
  "perspective-origin",
  z50.strictObject({
    x: unknownChildrenSchema,
    y: unknownChildrenSchema
  })
);

// src/prop-types/filter-prop-types/backdrop-filter.ts
import { z as z51 } from "@elementor/schema";
var backdropFilterPropTypeUtil = createPropUtils(
  "backdrop-filter",
  z51.array(cssFilterFunctionPropUtil.schema)
);

// src/utils/adjust-llm-prop-value-schema.ts
var ensureNotNull = (v, fallback) => v === null ? fallback : v;
var defaultOptions = {
  transformers: {}
};
var adjustLlmPropValueSchema = (value, { transformers = {}, forceKey = void 0 } = defaultOptions) => {
  const clone = structuredClone(value);
  if (typeof clone !== "object" || clone === null) {
    return null;
  }
  if (Array.isArray(clone)) {
    return clone.map((item) => adjustLlmPropValueSchema(item, { forceKey, transformers }));
  }
  const transformablePropValue = clone;
  if ("$intention" in transformablePropValue) {
    delete transformablePropValue.$intention;
  }
  if (forceKey) {
    transformablePropValue.$$type = forceKey;
  }
  switch (transformablePropValue.$$type) {
    case "size": {
      const { value: rawSizePropValue } = transformablePropValue;
      const unit = typeof rawSizePropValue.unit === "string" ? rawSizePropValue.unit : ensureNotNull(stringPropTypeUtil.extract(rawSizePropValue.unit), "px");
      const size = typeof rawSizePropValue.size === "string" || typeof rawSizePropValue.size === "number" ? rawSizePropValue.size : ensureNotNull(
        stringPropTypeUtil.extract(rawSizePropValue.size),
        numberPropTypeUtil.extract(rawSizePropValue.size)
      );
      return {
        $$type: "size",
        value: {
          unit,
          size
        }
      };
    }
    case "html-v3": {
      const { value: rawHtmlV3PropValue } = transformablePropValue;
      return {
        $$type: "html-v3",
        value: {
          content: rawHtmlV3PropValue.content,
          children: rawHtmlV3PropValue.children ?? []
        }
      };
    }
    default:
      const transformer = transformers?.[transformablePropValue.$$type];
      if (transformer) {
        return transformer(transformablePropValue.value);
      }
  }
  if (typeof transformablePropValue.value === "object") {
    if (Array.isArray(transformablePropValue.value)) {
      transformablePropValue.value = adjustLlmPropValueSchema(transformablePropValue.value, {
        transformers
      });
    } else {
      const { value: objectValue } = transformablePropValue;
      const clonedObject = clone;
      clonedObject.value = {};
      Object.entries(objectValue).forEach(([key, childProp]) => {
        clonedObject.value[key] = adjustLlmPropValueSchema(childProp, { transformers });
      });
    }
  }
  return clone;
};

// src/utils/llm-schema-to-props.ts
function jsonSchemaToPropType(schema, key = schema.key) {
  const meta = {};
  if (schema.description) {
    meta.description = schema.description;
  }
  if (schema.anyOf && Array.isArray(schema.anyOf)) {
    return convertJsonSchemaToUnionPropType(schema, meta);
  }
  if (schema.type === "object" && schema.properties) {
    return convertJsonSchemaToObjectPropType(schema, meta, key);
  }
  if (schema.type === "array" && schema.items) {
    return convertJsonSchemaToArrayPropType(schema, meta, key);
  }
  return convertJsonSchemaToPlainPropType(schema, meta, key);
}
function convertJsonSchemaToPlainPropType(schema, meta, key = schema.key) {
  const settings = {};
  let propKey = key || "string";
  if (schema.type === "number") {
    propKey = "number";
  } else if (schema.type === "boolean") {
    propKey = "boolean";
  } else if (schema.type === "string") {
    propKey = "string";
  }
  if (Array.isArray(schema.enum)) {
    settings.enum = schema.enum;
  }
  return {
    kind: "plain",
    key: propKey,
    settings,
    meta
  };
}
function convertJsonSchemaToUnionPropType(schema, meta) {
  const propTypes = {};
  if (!schema.anyOf || !Array.isArray(schema.anyOf)) {
    throw new Error("Invalid anyOf schema");
  }
  for (const variantSchema of schema.anyOf) {
    if (variantSchema.type === "object" && variantSchema.properties && variantSchema.properties.$$type && variantSchema.properties.value) {
      const typeProperty = variantSchema.properties.$$type;
      let typeKey;
      if (typeProperty.enum && Array.isArray(typeProperty.enum) && typeProperty.enum.length > 0) {
        typeKey = typeProperty.enum[0];
      } else {
        continue;
      }
      const valuePropType = convertJsonSchemaToPropType(variantSchema.properties.value);
      propTypes[typeKey] = valuePropType;
    }
  }
  return {
    kind: "union",
    prop_types: propTypes,
    settings: {},
    meta
  };
}
function convertJsonSchemaToObjectPropType(schema, meta, key = schema.key) {
  const shape = {};
  if (!schema.properties) {
    return {
      kind: "object",
      key,
      shape: {},
      settings: {},
      meta
    };
  }
  const requiredFields = Array.isArray(schema.required) ? schema.required : [];
  for (const [propKey, propSchema] of Object.entries(schema.properties)) {
    const subPropType = convertJsonSchemaToPropType(propSchema, key);
    if (requiredFields.includes(propKey)) {
      subPropType.settings = {
        ...subPropType.settings,
        required: true
      };
    }
    shape[propKey] = subPropType;
  }
  return {
    kind: "object",
    key: key || "object",
    shape,
    settings: {},
    meta
  };
}
function convertJsonSchemaToArrayPropType(schema, meta, key = schema.key) {
  if (!schema.items) {
    throw new Error("Array schema must have items property");
  }
  const itemPropType = convertJsonSchemaToPropType(schema.items);
  return {
    kind: "array",
    key: key || "array",
    item_prop_type: itemPropType,
    settings: {},
    meta
  };
}
function convertJsonSchemaToPropType(schema, key) {
  return jsonSchemaToPropType(schema, key);
}

// src/utils/props-to-llm-schema.ts
function propTypeToJsonSchema(propType) {
  const description = propType.meta?.description;
  const schema = {};
  if (description) {
    schema.description = description;
  }
  if (propType.initial_value !== null && propType.initial_value !== void 0) {
    schema.examples = [propType.initial_value];
  }
  switch (propType.kind) {
    case "union":
      return convertUnionPropType(propType, schema);
    case "object":
      return convertObjectPropType(propType, schema);
    case "array":
      return convertArrayPropType(propType, schema);
    default:
      return convertPlainPropType(propType, schema);
  }
}
function convertPlainPropType(propType, baseSchema) {
  const schema = { ...baseSchema };
  if (!Object.hasOwn(propType, "kind")) {
    throw new Error(`PropType kind is undefined for propType with key: ${propType.key ?? "[unknown key]"}`);
  }
  const enumValues = propType.settings?.enum || [];
  switch (propType.kind) {
    case "string":
    case "number":
    case "boolean":
      return {
        ...schema,
        type: "object",
        properties: {
          $$type: {
            type: "string",
            const: propType.key ?? propType.kind
          },
          value: {
            type: propType.kind,
            ...enumValues.length > 0 ? { enum: enumValues } : {}
          }
        },
        required: ["$$type", "value"]
      };
    default:
      return {
        ...schema,
        type: "object",
        $$type: propType.kind,
        value: {
          type: propType.kind
        }
      };
  }
}
function convertUnionPropType(propType, baseSchema) {
  const schema = structuredClone(baseSchema);
  const propTypes = propType.prop_types || {};
  const schemas = [];
  for (const [typeKey, subPropType] of Object.entries(propTypes)) {
    if (typeKey === "dynamic" || typeKey === "overridable") {
      continue;
    }
    const subSchema = convertPropTypeToJsonSchema(subPropType);
    schemas.push(subSchema);
  }
  if (schemas.length > 0) {
    schema.anyOf = schemas;
  }
  const propTypeDescription = propType.meta?.description;
  if (propTypeDescription) {
    schema.description = propTypeDescription;
  }
  return schema;
}
function convertObjectPropType(propType, baseSchema) {
  const schema = structuredClone(baseSchema);
  schema.type = "object";
  const internalStructure = {
    properties: {
      $$type: {
        type: "string",
        const: propType.key
      },
      value: {
        type: "object",
        properties: {},
        additionalProperties: false
      }
    }
  };
  const required = ["$$type", "value"];
  const valueRequired = [];
  const shape = propType.shape || {};
  for (const [key, subPropType] of Object.entries(shape)) {
    const propSchema = propTypeToJsonSchema(subPropType);
    if (subPropType.settings?.required === true) {
      valueRequired.push(key);
    }
    if (internalStructure.properties.value.properties) {
      internalStructure.properties.value.properties[key] = propSchema;
    }
  }
  schema.required = required;
  if (valueRequired.length > 0) {
    internalStructure.properties.value.required = valueRequired;
  }
  return {
    ...schema,
    ...internalStructure
  };
}
function convertArrayPropType(propType, baseSchema) {
  const schema = structuredClone(baseSchema);
  schema.type = "object";
  let items;
  const itemPropType = propType.item_prop_type;
  if (itemPropType) {
    items = convertPropTypeToJsonSchema(itemPropType);
  }
  schema.properties = {
    $$type: {
      type: "string",
      const: propType.key
    },
    value: {
      type: "array",
      ...items ? { items } : {}
    }
  };
  return schema;
}
function convertPropTypeToJsonSchema(propType) {
  return propTypeToJsonSchema(propType);
}
var nonConfigurablePropKeys = ["_cssid", "classes", "attributes"];
function isPropKeyConfigurable(propKey) {
  return !nonConfigurablePropKeys.includes(propKey);
}
function configurableKeys(schema) {
  return Object.keys(schema).filter(isPropKeyConfigurable);
}
function enrichWithIntention(jsonSchema, text = "Describe the desired outcome") {
  const result = structuredClone(jsonSchema);
  if (!result.properties) {
    return jsonSchema;
  }
  result.properties.$intention = {
    type: "string",
    description: text
  };
  result.required = [...result.required || [], "$intention"];
  return result;
}
function removeIntention(jsonSchema) {
  const result = structuredClone(jsonSchema);
  if (!result.properties) {
    return jsonSchema;
  }
  delete result.properties.$intention;
  if (result.required) {
    result.required = result.required.filter((req) => req !== "$intention");
  }
  return result;
}

// src/utils/validate-prop-value.ts
import { validate } from "jsonschema";
function processValidationError(error) {
  const detailed = {
    path: error.path,
    message: error.message,
    schema: error.schema,
    instance: error.instance,
    name: error.name
  };
  if (error.name === "anyOf" && error.schema && typeof error.schema === "object" && "anyOf" in error.schema) {
    const anyOfSchema = error.schema;
    const variants = (anyOfSchema.anyOf || []).map((variantSchema, idx) => {
      const variantResult = validate(error.instance, variantSchema);
      let discriminator = `variant-${idx}`;
      if (variantSchema && typeof variantSchema === "object" && "properties" in variantSchema && variantSchema.properties && typeof variantSchema.properties === "object" && "$$type" in variantSchema.properties) {
        const typeProperty = variantSchema.properties.$$type;
        if (typeProperty && typeof typeProperty === "object" && "const" in typeProperty && typeof typeProperty.const === "string") {
          discriminator = typeProperty.const;
        }
      }
      return {
        discriminator,
        errors: variantResult.errors.map(processValidationError)
      };
    });
    detailed.variants = variants;
  }
  return detailed;
}
function formatDetailedErrors(errors, indent = "") {
  const lines = [];
  for (const error of errors) {
    const pathStr = error.path.length > 0 ? error.path.join(".") : "root";
    lines.push(`${indent}Error at ${pathStr}: ${error.message}`);
    if (error.variants && error.variants.length > 0) {
      lines.push(`${indent}  Tried ${error.variants.length} variant(s):`);
      for (const variant of error.variants) {
        lines.push(`${indent}    - ${variant.discriminator}:`);
        if (variant.errors.length === 0) {
          lines.push(`${indent}        (no errors - this variant matched!)`);
        } else {
          for (const nestedError of variant.errors) {
            const nestedPathStr = nestedError.path.length > 0 ? nestedError.path.join(".") : "root";
            lines.push(`${indent}        ${nestedPathStr}: ${nestedError.message}`);
            if (nestedError.variants && nestedError.variants.length > 0) {
              lines.push(formatDetailedErrors([nestedError], `${indent}        `));
            }
          }
        }
      }
    }
  }
  return lines.join("\n");
}
var validatePropValue = (schema, value) => {
  const jsonSchema = propTypeToJsonSchema(schema);
  if (value === null) {
    return {
      valid: true,
      errors: [],
      errorMessages: [],
      jsonSchema: JSON.stringify(propTypeToJsonSchema(schema))
    };
  }
  const result = validate(value, jsonSchema);
  const detailedErrors = result.errors.map(processValidationError);
  return {
    valid: result.valid,
    errors: result.errors,
    errorMessages: formatDetailedErrors(detailedErrors),
    jsonSchema: JSON.stringify(jsonSchema)
  };
};

// src/utils/is-transformable.ts
import { z as z52 } from "@elementor/schema";
var transformableSchema = z52.object({
  $$type: z52.string(),
  value: z52.any(),
  disabled: z52.boolean().optional()
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

// src/utils/merge-props.ts
function mergeProps(current, updates) {
  let props = {};
  if (!Array.isArray(current)) {
    props = structuredClone(current);
  }
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
function isDependencyMet(dependency, values) {
  if (!dependency?.terms.length) {
    return { isMet: true };
  }
  const { relation, terms } = dependency;
  const method = getRelationMethod(relation);
  const failingDependencies = [];
  const isMet = terms[method]((term) => {
    const isNestedDependency = isDependency(term);
    const result = isNestedDependency ? isDependencyMet(term, values).isMet : evaluateTerm(term, extractValue(term.path, values, term.nestedPath)?.value);
    if (!result) {
      failingDependencies.push(term);
    }
    return result;
  });
  return { isMet, failingDependencies };
}
function evaluateTerm(term, actualValue) {
  const { value: valueToCompare, operator } = term;
  switch (operator) {
    case "eq":
    case "ne":
      return actualValue === valueToCompare === ("eq" === operator);
    case "gt":
    case "lte":
      if (!isNumber(actualValue) || !isNumber(valueToCompare)) {
        return false;
      }
      return Number(actualValue) > Number(valueToCompare) === ("gt" === operator);
    case "lt":
    case "gte":
      if (!isNumber(actualValue) || !isNumber(valueToCompare)) {
        return false;
      }
      return Number(actualValue) < Number(valueToCompare) === ("lt" === operator);
    case "in":
    case "nin":
      if (!Array.isArray(valueToCompare)) {
        return false;
      }
      return valueToCompare.includes(actualValue) === ("in" === operator);
    case "contains":
    case "ncontains":
      if (("string" !== typeof actualValue || "string" !== typeof valueToCompare) && !Array.isArray(actualValue)) {
        return false;
      }
      const transformedValue = Array.isArray(actualValue) ? actualValue.map((item) => isTransformable(item) ? item.value : item) : actualValue;
      return "contains" === operator === transformedValue.includes(valueToCompare);
    case "exists":
    case "not_exist":
      const evaluation = !!actualValue || 0 === actualValue || false === actualValue;
      return "exists" === operator === evaluation;
    default:
      return true;
  }
}
function isNumber(value) {
  return typeof value === "number" && !isNaN(value);
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
function extractValue(path, elementValues, nestedPath = []) {
  const extractedValue = path.reduce((acc, key, index) => {
    const value = acc?.[key];
    return index !== path.length - 1 && isTransformable(value) ? value.value ?? null : value;
  }, elementValues);
  if (!nestedPath?.length) {
    return extractedValue;
  }
  const nestedValue = nestedPath.reduce(
    (acc, key) => acc?.[key],
    extractedValue?.value
  );
  return {
    $$type: "unknown",
    value: nestedValue
  };
}
function isDependency(term) {
  return "terms" in term;
}

// src/utils/parse-html-children.ts
var INLINE_ELEMENTS = /* @__PURE__ */ new Set(["span", "b", "strong", "i", "em", "u", "a", "del", "sup", "sub", "s"]);
function generateElementId() {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `e-${timestamp}-${randomPart}`;
}
function traverseChildren(node) {
  const result = [];
  for (const child of Array.from(node.children)) {
    const tagName = child.tagName.toLowerCase();
    if (!INLINE_ELEMENTS.has(tagName)) {
      result.push(...traverseChildren(child));
      continue;
    }
    let id = child.getAttribute("id");
    if (!id) {
      id = generateElementId();
      child.setAttribute("id", id);
    }
    const childElement = {
      id,
      type: tagName
    };
    const textContent = child.textContent?.trim();
    if (textContent) {
      childElement.content = textContent;
    }
    const nestedChildren = traverseChildren(child);
    if (nestedChildren.length > 0) {
      childElement.children = nestedChildren;
    }
    result.push(childElement);
  }
  return result;
}
function parseHtmlChildren(html) {
  if (!html) {
    return { content: html, children: [] };
  }
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<body>${html}</body>`, "text/html");
  const parserError = doc.querySelector("parsererror");
  if (parserError) {
    console.warn("HTML parsing error, returning original content:", parserError.textContent);
    return { content: html, children: [] };
  }
  const body = doc.body;
  const children = traverseChildren(body);
  return {
    content: body.innerHTML,
    children
  };
}

// src/index.ts
var Schema = {
  jsonSchemaToPropType,
  propTypeToJsonSchema,
  adjustLlmPropValueSchema,
  isPropKeyConfigurable,
  nonConfigurablePropKeys,
  configurableKeys,
  validatePropValue,
  enrichWithIntention,
  removeIntention
};
export {
  CLASSES_PROP_KEY,
  DateTimePropTypeUtil,
  Schema,
  backdropFilterPropTypeUtil,
  backgroundColorOverlayPropTypeUtil,
  backgroundGradientOverlayPropTypeUtil,
  backgroundImageOverlayPropTypeUtil,
  backgroundImagePositionOffsetPropTypeUtil,
  backgroundImageSizeScalePropTypeUtil,
  backgroundOverlayItem,
  backgroundOverlayPropTypeUtil,
  backgroundPropTypeUtil,
  blurFilterPropTypeUtil,
  booleanPropTypeUtil,
  borderRadiusPropTypeUtil,
  borderWidthPropTypeUtil,
  boxShadowPropTypeUtil,
  classesPropTypeUtil,
  colorPropTypeUtil,
  colorStopPropTypeUtil,
  colorToneFilterPropTypeUtil,
  createArrayPropUtils,
  createPropUtils,
  cssFilterFunctionPropUtil,
  dimensionsPropTypeUtil,
  dropShadowFilterPropTypeUtil,
  emailPropTypeUtil,
  evaluateTerm,
  extractValue,
  filterEmptyValues,
  filterPropTypeUtil,
  flexPropTypeUtil,
  getPropSchemaFromCache,
  gradientColorStopPropTypeUtil,
  htmlPropTypeUtil,
  htmlV2PropTypeUtil,
  htmlV3PropTypeUtil,
  hueRotateFilterPropTypeUtil,
  imageAttachmentIdPropType,
  imagePropTypeUtil,
  imageSrcPropTypeUtil,
  intensityFilterPropTypeUtil,
  isDependency,
  isDependencyMet,
  isEmpty,
  isTransformable,
  keyValuePropTypeUtil,
  layoutDirectionPropTypeUtil,
  linkPropTypeUtil,
  mergeProps,
  moveTransformPropTypeUtil,
  numberPropTypeUtil,
  parseHtmlChildren,
  perspectiveOriginPropTypeUtil,
  positionPropTypeUtil,
  queryPropTypeUtil,
  rotateTransformPropTypeUtil,
  scaleTransformPropTypeUtil,
  selectionSizePropTypeUtil,
  shadowPropTypeUtil,
  sizePropTypeUtil,
  skewTransformPropTypeUtil,
  stringArrayPropTypeUtil,
  stringPropTypeUtil,
  strokePropTypeUtil,
  transformFunctionsPropTypeUtil,
  transformOriginPropTypeUtil,
  transformPropTypeUtil,
  urlPropTypeUtil,
  videoAttachmentIdPropType,
  videoSrcPropTypeUtil
};
//# sourceMappingURL=index.mjs.map