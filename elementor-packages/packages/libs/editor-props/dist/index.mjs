// src/prop-types/box-shadow.ts
import { z as z4 } from "@elementor/schema";

// src/utils/create-prop-utils.ts
import { z } from "@elementor/schema";
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
  return {
    extract,
    isValid,
    create,
    schema,
    key
  };
}
function createArrayPropUtils(key, valueSchema) {
  return createPropUtils(`${key}-array`, z.array(valueSchema));
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

// src/prop-types/image.ts
import { z as z9 } from "@elementor/schema";
var imagePropTypeUtil = createPropUtils(
  "image",
  z9.strictObject({
    src: unknownChildrenSchema,
    size: unknownChildrenSchema
  })
);

// src/prop-types/image-attachment-id.ts
import { z as z10 } from "@elementor/schema";
var imageAttachmentIdPropType = createPropUtils("image-attachment-id", z10.number());

// src/prop-types/image-src.ts
import { z as z11 } from "@elementor/schema";
var imageSrcPropTypeUtil = createPropUtils(
  "image-src",
  z11.strictObject({
    id: unknownChildrenSchema,
    url: z11.null()
  }).or(
    z11.strictObject({
      id: z11.null(),
      url: unknownChildrenSchema
    })
  )
);

// src/prop-types/dimensions.ts
import { z as z12 } from "@elementor/schema";
var dimensionsPropTypeUtil = createPropUtils(
  "dimensions",
  z12.strictObject({
    "block-start": unknownChildrenSchema,
    "block-end": unknownChildrenSchema,
    "inline-start": unknownChildrenSchema,
    "inline-end": unknownChildrenSchema
  })
);

// src/prop-types/number.ts
import { z as z13 } from "@elementor/schema";
var numberPropTypeUtil = createPropUtils("number", z13.number().nullable());

// src/prop-types/size.ts
import { z as z14 } from "@elementor/schema";
var sizePropTypeUtil = createPropUtils(
  "size",
  z14.strictObject({
    unit: z14.enum(["px", "em", "rem", "%", "vw", "vh"]),
    size: z14.number()
  }).or(
    z14.strictObject({
      unit: z14.literal("auto"),
      size: z14.literal("")
    })
  ).or(
    z14.strictObject({
      unit: z14.literal("custom"),
      size: z14.string()
    })
  )
);

// src/prop-types/string.ts
import { z as z15 } from "@elementor/schema";
var stringPropTypeUtil = createPropUtils("string", z15.string().nullable());

// src/prop-types/stroke.ts
import { z as z16 } from "@elementor/schema";
var strokePropTypeUtil = createPropUtils(
  "stroke",
  z16.strictObject({
    color: unknownChildrenSchema,
    width: unknownChildrenSchema
  })
);

// src/prop-types/url.ts
import { z as z17 } from "@elementor/schema";
var urlPropTypeUtil = createPropUtils("url", z17.string().nullable());

// src/prop-types/layout-direction.ts
import { z as z18 } from "@elementor/schema";
var layoutDirectionPropTypeUtil = createPropUtils(
  "layout-direction",
  z18.object({
    row: z18.any(),
    column: z18.any()
  })
);

// src/prop-types/link.ts
import { z as z19 } from "@elementor/schema";
var linkPropTypeUtil = createPropUtils(
  "link",
  z19.strictObject({
    destination: unknownChildrenSchema,
    label: unknownChildrenSchema,
    isTargetBlank: unknownChildrenSchema
  })
);

// src/prop-types/background-prop-types/background.ts
import { z as z20 } from "@elementor/schema";
var backgroundPropTypeUtil = createPropUtils(
  "background",
  z20.strictObject({
    color: unknownChildrenSchema,
    "background-overlay": unknownChildrenSchema
  })
);

// src/prop-types/background-prop-types/background-overlay.ts
import { z as z21 } from "@elementor/schema";

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
var backgroundOverlayPropTypeUtil = createPropUtils("background-overlay", z21.array(backgroundOverlayItem));

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
import { z as z22 } from "@elementor/schema";
var booleanPropTypeUtil = createPropUtils("boolean", z22.boolean().nullable());

// src/prop-types/color-stop.ts
import { z as z23 } from "@elementor/schema";
var colorStopPropTypeUtil = createPropUtils(
  "color-stop",
  z23.strictObject({
    color: unknownChildrenSchema,
    offset: unknownChildrenSchema
  })
);

// src/prop-types/gradient-color-stop.ts
import { z as z24 } from "@elementor/schema";
var gradientColorStopPropTypeUtil = createPropUtils(
  "gradient-color-stop",
  z24.array(colorStopPropTypeUtil.schema)
);

// src/prop-types/key-value.ts
import { z as z25 } from "@elementor/schema";
var keyValuePropTypeUtil = createPropUtils(
  "key-value",
  z25.strictObject({
    key: unknownChildrenSchema,
    value: unknownChildrenSchema
  })
);

// src/prop-types/position.ts
import { z as z26 } from "@elementor/schema";
var positionPropTypeUtil = createPropUtils(
  "object-position",
  z26.strictObject({
    x: sizePropTypeUtil.schema.nullable(),
    y: sizePropTypeUtil.schema.nullable()
  })
);

// src/prop-types/filter-prop-types/filter.ts
import { z as z27 } from "@elementor/schema";

// src/prop-types/filter-prop-types/blur-filter.ts
var blurFilterPropTypeUtil = createPropUtils("blur", unknownChildrenSchema);

// src/prop-types/filter-prop-types/brightness-filter.ts
var brightnessFilterPropTypeUtil = createPropUtils("brightness", unknownChildrenSchema);

// src/prop-types/filter-prop-types/filter.ts
var filterTypes = blurFilterPropTypeUtil.schema.or(brightnessFilterPropTypeUtil.schema);
var filterPropTypeUtil = createPropUtils("filter", z27.array(filterTypes));

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

// src/utils/is-transformable.ts
import { z as z28 } from "@elementor/schema";
var transformableSchema = z28.object({
  $$type: z28.string(),
  value: z28.any(),
  disabled: z28.boolean().optional()
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
export {
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
  sizePropTypeUtil,
  stringPropTypeUtil,
  strokePropTypeUtil,
  urlPropTypeUtil
};
//# sourceMappingURL=index.mjs.map