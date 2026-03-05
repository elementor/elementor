'use strict';
const __defProp = Object.defineProperty;
const __getOwnPropDesc = Object.getOwnPropertyDescriptor;
const __getOwnPropNames = Object.getOwnPropertyNames;
const __hasOwnProp = Object.prototype.hasOwnProperty;
const __export = (target, all) => {
	for (const name in all) {
		__defProp(target, name, { get: all[name], enumerable: true });
	}
};
const __copyProps = (to, from, except, desc) => {
	if ((from && typeof from === 'object') || typeof from === 'function') {
		for (const key of __getOwnPropNames(from)) {
			if (!__hasOwnProp.call(to, key) && key !== except) {
				__defProp(to, key, {
					get: () => from[key],
					enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
				});
			}
		}
	}
	return to;
};
const __toCommonJS = (mod) => __copyProps(__defProp({}, '__esModule', { value: true }), mod);

// src/index.ts
const index_exports = {};
__export(index_exports, {
	CLASSES_PROP_KEY: () => CLASSES_PROP_KEY,
	DateTimePropTypeUtil: () => DateTimePropTypeUtil,
	Schema: () => Schema,
	backdropFilterPropTypeUtil: () => backdropFilterPropTypeUtil,
	backgroundColorOverlayPropTypeUtil: () => backgroundColorOverlayPropTypeUtil,
	backgroundGradientOverlayPropTypeUtil: () => backgroundGradientOverlayPropTypeUtil,
	backgroundImageOverlayPropTypeUtil: () => backgroundImageOverlayPropTypeUtil,
	backgroundImagePositionOffsetPropTypeUtil: () => backgroundImagePositionOffsetPropTypeUtil,
	backgroundImageSizeScalePropTypeUtil: () => backgroundImageSizeScalePropTypeUtil,
	backgroundOverlayItem: () => backgroundOverlayItem,
	backgroundOverlayPropTypeUtil: () => backgroundOverlayPropTypeUtil,
	backgroundPropTypeUtil: () => backgroundPropTypeUtil,
	blurFilterPropTypeUtil: () => blurFilterPropTypeUtil,
	booleanPropTypeUtil: () => booleanPropTypeUtil,
	borderRadiusPropTypeUtil: () => borderRadiusPropTypeUtil,
	borderWidthPropTypeUtil: () => borderWidthPropTypeUtil,
	boxShadowPropTypeUtil: () => boxShadowPropTypeUtil,
	classesPropTypeUtil: () => classesPropTypeUtil,
	colorPropTypeUtil: () => colorPropTypeUtil,
	colorStopPropTypeUtil: () => colorStopPropTypeUtil,
	colorToneFilterPropTypeUtil: () => colorToneFilterPropTypeUtil,
	createArrayPropUtils: () => createArrayPropUtils,
	createPropUtils: () => createPropUtils,
	cssFilterFunctionPropUtil: () => cssFilterFunctionPropUtil,
	dimensionsPropTypeUtil: () => dimensionsPropTypeUtil,
	dropShadowFilterPropTypeUtil: () => dropShadowFilterPropTypeUtil,
	emailPropTypeUtil: () => emailPropTypeUtil,
	evaluateTerm: () => evaluateTerm,
	extractValue: () => extractValue,
	filterEmptyValues: () => filterEmptyValues,
	filterPropTypeUtil: () => filterPropTypeUtil,
	flexPropTypeUtil: () => flexPropTypeUtil,
	getPropSchemaFromCache: () => getPropSchemaFromCache,
	gradientColorStopPropTypeUtil: () => gradientColorStopPropTypeUtil,
	htmlPropTypeUtil: () => htmlPropTypeUtil,
	htmlV2PropTypeUtil: () => htmlV2PropTypeUtil,
	htmlV3PropTypeUtil: () => htmlV3PropTypeUtil,
	hueRotateFilterPropTypeUtil: () => hueRotateFilterPropTypeUtil,
	imageAttachmentIdPropType: () => imageAttachmentIdPropType,
	imagePropTypeUtil: () => imagePropTypeUtil,
	imageSrcPropTypeUtil: () => imageSrcPropTypeUtil,
	intensityFilterPropTypeUtil: () => intensityFilterPropTypeUtil,
	isDependency: () => isDependency,
	isDependencyMet: () => isDependencyMet,
	isEmpty: () => isEmpty,
	isTransformable: () => isTransformable,
	keyValuePropTypeUtil: () => keyValuePropTypeUtil,
	layoutDirectionPropTypeUtil: () => layoutDirectionPropTypeUtil,
	linkPropTypeUtil: () => linkPropTypeUtil,
	mergeProps: () => mergeProps,
	moveTransformPropTypeUtil: () => moveTransformPropTypeUtil,
	numberPropTypeUtil: () => numberPropTypeUtil,
	parseHtmlChildren: () => parseHtmlChildren,
	perspectiveOriginPropTypeUtil: () => perspectiveOriginPropTypeUtil,
	positionPropTypeUtil: () => positionPropTypeUtil,
	queryPropTypeUtil: () => queryPropTypeUtil,
	rotateTransformPropTypeUtil: () => rotateTransformPropTypeUtil,
	scaleTransformPropTypeUtil: () => scaleTransformPropTypeUtil,
	selectionSizePropTypeUtil: () => selectionSizePropTypeUtil,
	shadowPropTypeUtil: () => shadowPropTypeUtil,
	sizePropTypeUtil: () => sizePropTypeUtil,
	skewTransformPropTypeUtil: () => skewTransformPropTypeUtil,
	stringArrayPropTypeUtil: () => stringArrayPropTypeUtil,
	stringPropTypeUtil: () => stringPropTypeUtil,
	strokePropTypeUtil: () => strokePropTypeUtil,
	transformFunctionsPropTypeUtil: () => transformFunctionsPropTypeUtil,
	transformOriginPropTypeUtil: () => transformOriginPropTypeUtil,
	transformPropTypeUtil: () => transformPropTypeUtil,
	urlPropTypeUtil: () => urlPropTypeUtil,
	videoAttachmentIdPropType: () => videoAttachmentIdPropType,
	videoSrcPropTypeUtil: () => videoSrcPropTypeUtil,
});
module.exports = __toCommonJS(index_exports);

// src/prop-types/box-shadow.ts
const import_schema4 = require('@elementor/schema');

// src/utils/create-prop-utils.ts
const import_schema = require('@elementor/schema');
const SCHEMA_CACHE = /* @__PURE__ */ new Map();
function getPropSchemaFromCache(key) {
	return SCHEMA_CACHE.get(key);
}
function createPropUtils(key, valueSchema) {
	const schema = import_schema.z.strictObject({
		$$type: import_schema.z.literal(key),
		value: valueSchema,
		disabled: import_schema.z.boolean().optional(),
	});
	function isValid(prop) {
		return schema.safeParse(prop).success;
	}
	function create(value, createOptions) {
		const fn = typeof value === 'function' ? value : () => value;
		const { base, disabled } = createOptions || {};
		if (!base) {
			return {
				$$type: key,
				value: fn(),
				...(disabled && { disabled }),
			};
		}
		if (!isValid(base)) {
			throw new Error(`Cannot create prop based on invalid value: ${JSON.stringify(base)}`);
		}
		return {
			$$type: key,
			value: fn(base.value),
			...(disabled && { disabled }),
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
		key,
	};
	SCHEMA_CACHE.set(key, propUtil);
	return propUtil;
}
function createArrayPropUtils(key, valueSchema, overrideKey) {
	return createPropUtils(overrideKey || `${key}-array`, import_schema.z.array(valueSchema));
}

// src/prop-types/shadow.ts
const import_schema3 = require('@elementor/schema');

// src/prop-types/utils.ts
const import_schema2 = require('@elementor/schema');
const unknownChildrenSchema = import_schema2.z.any().nullable();

// src/prop-types/shadow.ts
var shadowPropTypeUtil = createPropUtils(
	'shadow',
	import_schema3.z.strictObject({
		position: unknownChildrenSchema,
		hOffset: unknownChildrenSchema,
		vOffset: unknownChildrenSchema,
		blur: unknownChildrenSchema,
		spread: unknownChildrenSchema,
		color: unknownChildrenSchema,
	})
);

// src/prop-types/box-shadow.ts
var boxShadowPropTypeUtil = createPropUtils('box-shadow', import_schema4.z.array(shadowPropTypeUtil.schema));

// src/prop-types/border-radius.ts
const import_schema5 = require('@elementor/schema');
var borderRadiusPropTypeUtil = createPropUtils(
	'border-radius',
	import_schema5.z.strictObject({
		'start-start': unknownChildrenSchema,
		'start-end': unknownChildrenSchema,
		'end-start': unknownChildrenSchema,
		'end-end': unknownChildrenSchema,
	})
);

// src/prop-types/border-width.ts
const import_schema6 = require('@elementor/schema');
var borderWidthPropTypeUtil = createPropUtils(
	'border-width',
	import_schema6.z.strictObject({
		'block-start': unknownChildrenSchema,
		'block-end': unknownChildrenSchema,
		'inline-start': unknownChildrenSchema,
		'inline-end': unknownChildrenSchema,
	})
);

// src/prop-types/classes.ts
const import_schema7 = require('@elementor/schema');
var CLASSES_PROP_KEY = 'classes';
var classesPropTypeUtil = createPropUtils(
	CLASSES_PROP_KEY,
	import_schema7.z.array(import_schema7.z.string().regex(/^[a-z][a-z-_0-9]*$/i))
);

// src/prop-types/color.ts
const import_schema8 = require('@elementor/schema');
var colorPropTypeUtil = createPropUtils('color', import_schema8.z.string());

// src/prop-types/flex.ts
const import_schema9 = require('@elementor/schema');
var flexPropTypeUtil = createPropUtils(
	'flex',
	import_schema9.z.strictObject({
		flexGrow: unknownChildrenSchema,
		flexShrink: unknownChildrenSchema,
		flexBasis: unknownChildrenSchema,
	})
);

// src/prop-types/image.ts
const import_schema10 = require('@elementor/schema');
var imagePropTypeUtil = createPropUtils(
	'image',
	import_schema10.z.strictObject({
		src: unknownChildrenSchema,
		size: unknownChildrenSchema,
	})
);

// src/prop-types/image-attachment-id.ts
const import_schema11 = require('@elementor/schema');
var imageAttachmentIdPropType = createPropUtils('image-attachment-id', import_schema11.z.number());

// src/prop-types/image-src.ts
const import_schema12 = require('@elementor/schema');
var imageSrcPropTypeUtil = createPropUtils(
	'image-src',
	import_schema12.z
		.strictObject({
			id: unknownChildrenSchema,
			url: import_schema12.z.null(),
		})
		.or(
			import_schema12.z.strictObject({
				id: import_schema12.z.null(),
				url: unknownChildrenSchema,
			})
		)
);

// src/prop-types/video-attachment-id.ts
const import_schema13 = require('@elementor/schema');
var videoAttachmentIdPropType = createPropUtils('video-attachment-id', import_schema13.z.number());

// src/prop-types/video-src.ts
const import_schema14 = require('@elementor/schema');
var videoSrcPropTypeUtil = createPropUtils(
	'video-src',
	import_schema14.z
		.strictObject({
			id: unknownChildrenSchema,
			url: import_schema14.z.null(),
		})
		.or(
			import_schema14.z.strictObject({
				id: import_schema14.z.null(),
				url: unknownChildrenSchema,
			})
		)
);

// src/prop-types/dimensions.ts
const import_schema15 = require('@elementor/schema');
var dimensionsPropTypeUtil = createPropUtils(
	'dimensions',
	import_schema15.z.strictObject({
		'block-start': unknownChildrenSchema,
		'block-end': unknownChildrenSchema,
		'inline-start': unknownChildrenSchema,
		'inline-end': unknownChildrenSchema,
	})
);

// src/prop-types/number.ts
const import_schema16 = require('@elementor/schema');
var numberPropTypeUtil = createPropUtils('number', import_schema16.z.number().nullable());

// src/prop-types/size.ts
const import_schema17 = require('@elementor/schema');
var sizePropTypeUtil = createPropUtils(
	'size',
	import_schema17.z
		.strictObject({
			unit: import_schema17.z.enum(['px', 'em', 'rem', '%', 'vw', 'vh', 'ch']),
			size: import_schema17.z.number(),
		})
		.or(
			import_schema17.z.strictObject({
				unit: import_schema17.z.enum(['deg', 'rad', 'grad', 'turn']),
				size: import_schema17.z.number(),
			})
		)
		.or(
			import_schema17.z.strictObject({
				unit: import_schema17.z.enum(['s', 'ms']),
				size: import_schema17.z.number(),
			})
		)
		.or(
			import_schema17.z.strictObject({
				unit: import_schema17.z.literal('auto'),
				size: import_schema17.z.literal(''),
			})
		)
		.or(
			import_schema17.z.strictObject({
				unit: import_schema17.z.literal('custom'),
				size: import_schema17.z.string(),
			})
		)
);

// src/prop-types/string.ts
const import_schema18 = require('@elementor/schema');
var stringPropTypeUtil = createPropUtils('string', import_schema18.z.string().nullable());

// src/prop-types/string-array.ts
var stringArrayPropTypeUtil = createArrayPropUtils(stringPropTypeUtil.key, stringPropTypeUtil.schema);

// src/prop-types/stroke.ts
const import_schema19 = require('@elementor/schema');
var strokePropTypeUtil = createPropUtils(
	'stroke',
	import_schema19.z.strictObject({
		color: unknownChildrenSchema,
		width: unknownChildrenSchema,
	})
);

// src/prop-types/url.ts
const import_schema20 = require('@elementor/schema');
var urlPropTypeUtil = createPropUtils('url', import_schema20.z.string().nullable());

// src/prop-types/layout-direction.ts
const import_schema21 = require('@elementor/schema');
var layoutDirectionPropTypeUtil = createPropUtils(
	'layout-direction',
	import_schema21.z.object({
		row: import_schema21.z.any(),
		column: import_schema21.z.any(),
	})
);

// src/prop-types/link.ts
const import_schema22 = require('@elementor/schema');
var linkPropTypeUtil = createPropUtils(
	'link',
	import_schema22.z.strictObject({
		destination: unknownChildrenSchema,
		isTargetBlank: unknownChildrenSchema,
		tag: unknownChildrenSchema,
	})
);

// src/prop-types/email.ts
const import_schema23 = require('@elementor/schema');
var emailPropTypeUtil = createPropUtils(
	'email',
	import_schema23.z.strictObject({
		to: unknownChildrenSchema,
		subject: unknownChildrenSchema,
		message: unknownChildrenSchema,
		from: unknownChildrenSchema,
		'meta-data': unknownChildrenSchema,
		'send-as': unknownChildrenSchema,
		'from-name': unknownChildrenSchema,
		'reply-to': unknownChildrenSchema,
		cc: unknownChildrenSchema,
		bcc: unknownChildrenSchema,
	})
);

// src/prop-types/selection-size.ts
const import_schema25 = require('@elementor/schema');

// src/prop-types/key-value.ts
const import_schema24 = require('@elementor/schema');
var keyValuePropTypeUtil = createPropUtils(
	'key-value',
	import_schema24.z.strictObject({
		key: unknownChildrenSchema,
		value: unknownChildrenSchema,
	})
);

// src/prop-types/selection-size.ts
var selectionSizePropTypeUtil = createPropUtils(
	'selection-size',
	import_schema25.z.strictObject({
		selection: import_schema25.z.union([keyValuePropTypeUtil.schema, stringPropTypeUtil.schema]),
		size: unknownChildrenSchema,
	})
);

// src/prop-types/background-prop-types/background.ts
const import_schema26 = require('@elementor/schema');
var backgroundPropTypeUtil = createPropUtils(
	'background',
	import_schema26.z.strictObject({
		color: unknownChildrenSchema,
		clip: unknownChildrenSchema,
		'background-overlay': unknownChildrenSchema,
	})
);

// src/prop-types/background-prop-types/background-overlay.ts
const import_schema27 = require('@elementor/schema');

// src/prop-types/background-prop-types/background-color-overlay.ts
var backgroundColorOverlayPropTypeUtil = createPropUtils('background-color-overlay', unknownChildrenSchema);

// src/prop-types/background-prop-types/background-gradient-overlay.ts
var backgroundGradientOverlayPropTypeUtil = createPropUtils('background-gradient-overlay', unknownChildrenSchema);

// src/prop-types/background-prop-types/background-image-overlay.ts
var backgroundImageOverlayPropTypeUtil = createPropUtils('background-image-overlay', unknownChildrenSchema);

// src/prop-types/background-prop-types/background-overlay.ts
var backgroundOverlayItem = backgroundColorOverlayPropTypeUtil.schema
	.or(backgroundGradientOverlayPropTypeUtil.schema)
	.or(backgroundImageOverlayPropTypeUtil.schema);
var backgroundOverlayPropTypeUtil = createPropUtils(
	'background-overlay',
	import_schema27.z.array(backgroundOverlayItem)
);

// src/prop-types/background-prop-types/background-image-position-offset.ts
var backgroundImagePositionOffsetPropTypeUtil = createPropUtils(
	'background-image-position-offset',
	unknownChildrenSchema
);

// src/prop-types/background-prop-types/background-image-size-scale.ts
var backgroundImageSizeScalePropTypeUtil = createPropUtils('background-image-size-scale', unknownChildrenSchema);

// src/prop-types/boolean.ts
const import_schema28 = require('@elementor/schema');
var booleanPropTypeUtil = createPropUtils('boolean', import_schema28.z.boolean().nullable());

// src/prop-types/color-stop.ts
const import_schema29 = require('@elementor/schema');
var colorStopPropTypeUtil = createPropUtils(
	'color-stop',
	import_schema29.z.strictObject({
		color: unknownChildrenSchema,
		offset: unknownChildrenSchema,
	})
);

// src/prop-types/gradient-color-stop.ts
const import_schema30 = require('@elementor/schema');
var gradientColorStopPropTypeUtil = createPropUtils(
	'gradient-color-stop',
	import_schema30.z.array(colorStopPropTypeUtil.schema)
);

// src/prop-types/date-time.ts
const import_schema31 = require('@elementor/schema');
var DateTimePropTypeUtil = createPropUtils(
	'date-time',
	import_schema31.z.strictObject({
		date: unknownChildrenSchema,
		time: unknownChildrenSchema,
	})
);

// src/prop-types/position.ts
const import_schema32 = require('@elementor/schema');
var positionPropTypeUtil = createPropUtils(
	'object-position',
	import_schema32.z.strictObject({
		x: unknownChildrenSchema,
		y: unknownChildrenSchema,
	})
);

// src/prop-types/query.ts
const import_schema33 = require('@elementor/schema');
var queryPropTypeUtil = createPropUtils(
	'query',
	import_schema33.z.strictObject({
		id: unknownChildrenSchema,
		label: unknownChildrenSchema,
	})
);

// src/prop-types/html.ts
const import_schema34 = require('@elementor/schema');
var htmlPropTypeUtil = createPropUtils('html', import_schema34.z.string().nullable());

// src/prop-types/html-v2.ts
const import_schema35 = require('@elementor/schema');
var childElementSchema = import_schema35.z.lazy(() =>
	import_schema35.z.object({
		id: import_schema35.z.string(),
		type: import_schema35.z.string(),
		content: import_schema35.z.string().optional(),
		children: import_schema35.z.array(childElementSchema).optional(),
	})
);
const htmlV2ValueSchema = import_schema35.z.object({
	content: import_schema35.z.string().nullable(),
	children: import_schema35.z.array(childElementSchema),
});
var htmlV2PropTypeUtil = createPropUtils('html-v2', htmlV2ValueSchema);

// src/prop-types/html-v3.ts
const import_schema36 = require('@elementor/schema');
const htmlV3ValueSchema = import_schema36.z.object({
	content: stringPropTypeUtil.schema.nullable(),
	children: import_schema36.z.array(import_schema36.z.unknown()),
});
var htmlV3PropTypeUtil = createPropUtils('html-v3', htmlV3ValueSchema);

// src/prop-types/filter-prop-types/filter.ts
const import_schema42 = require('@elementor/schema');

// src/prop-types/filter-prop-types/drop-shadow-filter.ts
const import_schema37 = require('@elementor/schema');
var dropShadowFilterPropTypeUtil = createPropUtils(
	'drop-shadow',
	import_schema37.z.object({
		xAxis: unknownChildrenSchema,
		yAxis: unknownChildrenSchema,
		blur: unknownChildrenSchema,
		color: unknownChildrenSchema,
	})
);

// src/prop-types/filter-prop-types/filter-functions/blur-filter.ts
const import_schema38 = require('@elementor/schema');
var blurFilterPropTypeUtil = createPropUtils(
	'blur',
	import_schema38.z.strictObject({
		size: unknownChildrenSchema,
	})
);

// src/prop-types/filter-prop-types/filter-functions/color-tone-filter.ts
const import_schema39 = require('@elementor/schema');
var colorToneFilterPropTypeUtil = createPropUtils(
	'color-tone',
	import_schema39.z.strictObject({
		size: unknownChildrenSchema,
	})
);

// src/prop-types/filter-prop-types/filter-functions/hue-rotate-filter.ts
const import_schema40 = require('@elementor/schema');
var hueRotateFilterPropTypeUtil = createPropUtils(
	'hue-rotate',
	import_schema40.z.strictObject({
		size: unknownChildrenSchema,
	})
);

// src/prop-types/filter-prop-types/filter-functions/intensity-filter.ts
const import_schema41 = require('@elementor/schema');
var intensityFilterPropTypeUtil = createPropUtils(
	'intensity',
	import_schema41.z.strictObject({
		size: unknownChildrenSchema,
	})
);

// src/prop-types/filter-prop-types/filter.ts
var cssFilterFunctionPropUtil = createPropUtils(
	'css-filter-func',
	import_schema42.z.object({
		func: stringPropTypeUtil.schema,
		args: import_schema42.z.union([
			blurFilterPropTypeUtil.schema,
			intensityFilterPropTypeUtil.schema,
			colorToneFilterPropTypeUtil.schema,
			hueRotateFilterPropTypeUtil.schema,
			dropShadowFilterPropTypeUtil.schema,
		]),
	})
);
var filterPropTypeUtil = createPropUtils('filter', import_schema42.z.array(cssFilterFunctionPropUtil.schema));

// src/prop-types/transform-prop-types/transform.ts
const import_schema43 = require('@elementor/schema');
var transformPropTypeUtil = createPropUtils(
	'transform',
	import_schema43.z.strictObject({
		'transform-functions': unknownChildrenSchema,
		'transform-origin': unknownChildrenSchema,
		perspective: unknownChildrenSchema,
		'perspective-origin': unknownChildrenSchema,
	})
);

// src/prop-types/transform-prop-types/transform-functions.ts
const import_schema48 = require('@elementor/schema');

// src/prop-types/transform-prop-types/transform-functions/move-transform.ts
const import_schema44 = require('@elementor/schema');

// src/prop-types/transform-prop-types/types.ts
const TransformFunctionKeys = {
	move: 'transform-move',
	scale: 'transform-scale',
	rotate: 'transform-rotate',
	skew: 'transform-skew',
};

// src/prop-types/transform-prop-types/transform-functions/move-transform.ts
var moveTransformPropTypeUtil = createPropUtils(
	TransformFunctionKeys.move,
	import_schema44.z.strictObject({
		x: unknownChildrenSchema,
		y: unknownChildrenSchema,
		z: unknownChildrenSchema,
	})
);

// src/prop-types/transform-prop-types/transform-functions/rotate-transform.ts
const import_schema45 = require('@elementor/schema');
var rotateTransformPropTypeUtil = createPropUtils(
	TransformFunctionKeys.rotate,
	import_schema45.z.strictObject({
		x: unknownChildrenSchema,
		y: unknownChildrenSchema,
		z: unknownChildrenSchema,
	})
);

// src/prop-types/transform-prop-types/transform-functions/scale-transform.ts
const import_schema46 = require('@elementor/schema');
var scaleTransformPropTypeUtil = createPropUtils(
	TransformFunctionKeys.scale,
	import_schema46.z.strictObject({
		x: numberPropTypeUtil.schema.nullable(),
		y: numberPropTypeUtil.schema.nullable(),
		z: numberPropTypeUtil.schema.nullable(),
	})
);

// src/prop-types/transform-prop-types/transform-functions/skew-transform.ts
const import_schema47 = require('@elementor/schema');
var skewTransformPropTypeUtil = createPropUtils(
	TransformFunctionKeys.skew,
	import_schema47.z.strictObject({
		x: unknownChildrenSchema,
		y: unknownChildrenSchema,
	})
);

// src/prop-types/transform-prop-types/transform-functions.ts
const filterTypes = moveTransformPropTypeUtil.schema
	.or(scaleTransformPropTypeUtil.schema)
	.or(rotateTransformPropTypeUtil.schema)
	.or(skewTransformPropTypeUtil.schema);
var transformFunctionsPropTypeUtil = createPropUtils('transform-functions', import_schema48.z.array(filterTypes));

// src/prop-types/transform-prop-types/transform-origin.ts
const import_schema49 = require('@elementor/schema');
var transformOriginPropTypeUtil = createPropUtils(
	'transform-origin',
	import_schema49.z.strictObject({
		x: unknownChildrenSchema,
		y: unknownChildrenSchema,
		z: unknownChildrenSchema,
	})
);

// src/prop-types/transform-prop-types/perspective-origin.ts
const import_schema50 = require('@elementor/schema');
var perspectiveOriginPropTypeUtil = createPropUtils(
	'perspective-origin',
	import_schema50.z.strictObject({
		x: unknownChildrenSchema,
		y: unknownChildrenSchema,
	})
);

// src/prop-types/filter-prop-types/backdrop-filter.ts
const import_schema51 = require('@elementor/schema');
var backdropFilterPropTypeUtil = createPropUtils(
	'backdrop-filter',
	import_schema51.z.array(cssFilterFunctionPropUtil.schema)
);

// src/utils/adjust-llm-prop-value-schema.ts
const ensureNotNull = (v, fallback) => (v === null ? fallback : v);
const defaultOptions = {
	transformers: {},
};
const adjustLlmPropValueSchema = (value, { transformers = {}, forceKey = void 0 } = defaultOptions) => {
	const clone = structuredClone(value);
	if (typeof clone !== 'object' || clone === null) {
		return null;
	}
	if (Array.isArray(clone)) {
		return clone.map((item) => adjustLlmPropValueSchema(item, { forceKey, transformers }));
	}
	const transformablePropValue = clone;
	if ('$intention' in transformablePropValue) {
		delete transformablePropValue.$intention;
	}
	if (forceKey) {
		transformablePropValue.$$type = forceKey;
	}
	switch (transformablePropValue.$$type) {
		case 'size': {
			const { value: rawSizePropValue } = transformablePropValue;
			const unit =
				typeof rawSizePropValue.unit === 'string'
					? rawSizePropValue.unit
					: ensureNotNull(stringPropTypeUtil.extract(rawSizePropValue.unit), 'px');
			const size =
				typeof rawSizePropValue.size === 'string' || typeof rawSizePropValue.size === 'number'
					? rawSizePropValue.size
					: ensureNotNull(
							stringPropTypeUtil.extract(rawSizePropValue.size),
							numberPropTypeUtil.extract(rawSizePropValue.size)
						);
			return {
				$$type: 'size',
				value: {
					unit,
					size,
				},
			};
		}
		case 'html-v3': {
			const { value: rawHtmlV3PropValue } = transformablePropValue;
			return {
				$$type: 'html-v3',
				value: {
					content: rawHtmlV3PropValue.content,
					children: rawHtmlV3PropValue.children ?? [],
				},
			};
		}
		default:
			const transformer = transformers?.[transformablePropValue.$$type];
			if (transformer) {
				return transformer(transformablePropValue.value);
			}
	}
	if (typeof transformablePropValue.value === 'object') {
		if (Array.isArray(transformablePropValue.value)) {
			transformablePropValue.value = adjustLlmPropValueSchema(transformablePropValue.value, {
				transformers,
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
	if (schema.type === 'object' && schema.properties) {
		return convertJsonSchemaToObjectPropType(schema, meta, key);
	}
	if (schema.type === 'array' && schema.items) {
		return convertJsonSchemaToArrayPropType(schema, meta, key);
	}
	return convertJsonSchemaToPlainPropType(schema, meta, key);
}
function convertJsonSchemaToPlainPropType(schema, meta, key = schema.key) {
	const settings = {};
	let propKey = key || 'string';
	if (schema.type === 'number') {
		propKey = 'number';
	} else if (schema.type === 'boolean') {
		propKey = 'boolean';
	} else if (schema.type === 'string') {
		propKey = 'string';
	}
	if (Array.isArray(schema.enum)) {
		settings.enum = schema.enum;
	}
	return {
		kind: 'plain',
		key: propKey,
		settings,
		meta,
	};
}
function convertJsonSchemaToUnionPropType(schema, meta) {
	const propTypes = {};
	if (!schema.anyOf || !Array.isArray(schema.anyOf)) {
		throw new Error('Invalid anyOf schema');
	}
	for (const variantSchema of schema.anyOf) {
		if (
			variantSchema.type === 'object' &&
			variantSchema.properties &&
			variantSchema.properties.$$type &&
			variantSchema.properties.value
		) {
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
		kind: 'union',
		prop_types: propTypes,
		settings: {},
		meta,
	};
}
function convertJsonSchemaToObjectPropType(schema, meta, key = schema.key) {
	const shape = {};
	if (!schema.properties) {
		return {
			kind: 'object',
			key,
			shape: {},
			settings: {},
			meta,
		};
	}
	const requiredFields = Array.isArray(schema.required) ? schema.required : [];
	for (const [propKey, propSchema] of Object.entries(schema.properties)) {
		const subPropType = convertJsonSchemaToPropType(propSchema, key);
		if (requiredFields.includes(propKey)) {
			subPropType.settings = {
				...subPropType.settings,
				required: true,
			};
		}
		shape[propKey] = subPropType;
	}
	return {
		kind: 'object',
		key: key || 'object',
		shape,
		settings: {},
		meta,
	};
}
function convertJsonSchemaToArrayPropType(schema, meta, key = schema.key) {
	if (!schema.items) {
		throw new Error('Array schema must have items property');
	}
	const itemPropType = convertJsonSchemaToPropType(schema.items);
	return {
		kind: 'array',
		key: key || 'array',
		item_prop_type: itemPropType,
		settings: {},
		meta,
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
		case 'union':
			return convertUnionPropType(propType, schema);
		case 'object':
			return convertObjectPropType(propType, schema);
		case 'array':
			return convertArrayPropType(propType, schema);
		default:
			return convertPlainPropType(propType, schema);
	}
}
function convertPlainPropType(propType, baseSchema) {
	const schema = { ...baseSchema };
	if (!Object.hasOwn(propType, 'kind')) {
		throw new Error(`PropType kind is undefined for propType with key: ${propType.key ?? '[unknown key]'}`);
	}
	const enumValues = propType.settings?.enum || [];
	switch (propType.kind) {
		case 'string':
		case 'number':
		case 'boolean':
			return {
				...schema,
				type: 'object',
				properties: {
					$$type: {
						type: 'string',
						const: propType.key ?? propType.kind,
					},
					value: {
						type: propType.kind,
						...(enumValues.length > 0 ? { enum: enumValues } : {}),
					},
				},
				required: ['$$type', 'value'],
			};
		default:
			return {
				...schema,
				type: 'object',
				$$type: propType.kind,
				value: {
					type: propType.kind,
				},
			};
	}
}
function convertUnionPropType(propType, baseSchema) {
	const schema = structuredClone(baseSchema);
	const propTypes = propType.prop_types || {};
	const schemas = [];
	for (const [typeKey, subPropType] of Object.entries(propTypes)) {
		if (typeKey === 'dynamic' || typeKey === 'overridable') {
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
	schema.type = 'object';
	const internalStructure = {
		properties: {
			$$type: {
				type: 'string',
				const: propType.key,
			},
			value: {
				type: 'object',
				properties: {},
				additionalProperties: false,
			},
		},
	};
	const required = ['$$type', 'value'];
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
		...internalStructure,
	};
}
function convertArrayPropType(propType, baseSchema) {
	const schema = structuredClone(baseSchema);
	schema.type = 'object';
	let items;
	const itemPropType = propType.item_prop_type;
	if (itemPropType) {
		items = convertPropTypeToJsonSchema(itemPropType);
	}
	schema.properties = {
		$$type: {
			type: 'string',
			const: propType.key,
		},
		value: {
			type: 'array',
			...(items ? { items } : {}),
		},
	};
	return schema;
}
function convertPropTypeToJsonSchema(propType) {
	return propTypeToJsonSchema(propType);
}
const nonConfigurablePropKeys = ['_cssid', 'classes', 'attributes'];
function isPropKeyConfigurable(propKey) {
	return !nonConfigurablePropKeys.includes(propKey);
}
function configurableKeys(schema) {
	return Object.keys(schema).filter(isPropKeyConfigurable);
}
function enrichWithIntention(jsonSchema, text = 'Describe the desired outcome') {
	const result = structuredClone(jsonSchema);
	if (!result.properties) {
		return jsonSchema;
	}
	result.properties.$intention = {
		type: 'string',
		description: text,
	};
	result.required = [...(result.required || []), '$intention'];
	return result;
}
function removeIntention(jsonSchema) {
	const result = structuredClone(jsonSchema);
	if (!result.properties) {
		return jsonSchema;
	}
	delete result.properties.$intention;
	if (result.required) {
		result.required = result.required.filter((req) => req !== '$intention');
	}
	return result;
}

// src/utils/validate-prop-value.ts
const import_jsonschema = require('jsonschema');
function processValidationError(error) {
	const detailed = {
		path: error.path,
		message: error.message,
		schema: error.schema,
		instance: error.instance,
		name: error.name,
	};
	if (error.name === 'anyOf' && error.schema && typeof error.schema === 'object' && 'anyOf' in error.schema) {
		const anyOfSchema = error.schema;
		const variants = (anyOfSchema.anyOf || []).map((variantSchema, idx) => {
			const variantResult = (0, import_jsonschema.validate)(error.instance, variantSchema);
			let discriminator = `variant-${idx}`;
			if (
				variantSchema &&
				typeof variantSchema === 'object' &&
				'properties' in variantSchema &&
				variantSchema.properties &&
				typeof variantSchema.properties === 'object' &&
				'$$type' in variantSchema.properties
			) {
				const typeProperty = variantSchema.properties.$$type;
				if (
					typeProperty &&
					typeof typeProperty === 'object' &&
					'const' in typeProperty &&
					typeof typeProperty.const === 'string'
				) {
					discriminator = typeProperty.const;
				}
			}
			return {
				discriminator,
				errors: variantResult.errors.map(processValidationError),
			};
		});
		detailed.variants = variants;
	}
	return detailed;
}
function formatDetailedErrors(errors, indent = '') {
	const lines = [];
	for (const error of errors) {
		const pathStr = error.path.length > 0 ? error.path.join('.') : 'root';
		lines.push(`${indent}Error at ${pathStr}: ${error.message}`);
		if (error.variants && error.variants.length > 0) {
			lines.push(`${indent}  Tried ${error.variants.length} variant(s):`);
			for (const variant of error.variants) {
				lines.push(`${indent}    - ${variant.discriminator}:`);
				if (variant.errors.length === 0) {
					lines.push(`${indent}        (no errors - this variant matched!)`);
				} else {
					for (const nestedError of variant.errors) {
						const nestedPathStr = nestedError.path.length > 0 ? nestedError.path.join('.') : 'root';
						lines.push(`${indent}        ${nestedPathStr}: ${nestedError.message}`);
						if (nestedError.variants && nestedError.variants.length > 0) {
							lines.push(formatDetailedErrors([nestedError], `${indent}        `));
						}
					}
				}
			}
		}
	}
	return lines.join('\n');
}
const validatePropValue = (schema, value) => {
	const jsonSchema = propTypeToJsonSchema(schema);
	if (value === null) {
		return {
			valid: true,
			errors: [],
			errorMessages: [],
			jsonSchema: JSON.stringify(propTypeToJsonSchema(schema)),
		};
	}
	const result = (0, import_jsonschema.validate)(value, jsonSchema);
	const detailedErrors = result.errors.map(processValidationError);
	return {
		valid: result.valid,
		errors: result.errors,
		errorMessages: formatDetailedErrors(detailedErrors),
		jsonSchema: JSON.stringify(jsonSchema),
	};
};

// src/utils/is-transformable.ts
const import_schema52 = require('@elementor/schema');
const transformableSchema = import_schema52.z.object({
	$$type: import_schema52.z.string(),
	value: import_schema52.z.any(),
	disabled: import_schema52.z.boolean().optional(),
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
	if (typeof value === 'object') {
		return Object.fromEntries(
			Object.entries(value)
				.map(([key, val]) => [key, filterEmptyValues(val)])
				.filter(([, val]) => !isEmpty(val))
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
var isNullish = (value) => value === null || value === void 0 || value === '';
var isNullishArray = (value) => Array.isArray(value) && value.every(isEmpty);
var isNullishObject = (value) => {
	return typeof value === 'object' && isNullishArray(Object.values(value));
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
		const result = isNestedDependency
			? isDependencyMet(term, values).isMet
			: evaluateTerm(term, extractValue(term.path, values, term.nestedPath)?.value);
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
		case 'eq':
		case 'ne':
			return (actualValue === valueToCompare) === ('eq' === operator);
		case 'gt':
		case 'lte':
			if (!isNumber(actualValue) || !isNumber(valueToCompare)) {
				return false;
			}
			return Number(actualValue) > Number(valueToCompare) === ('gt' === operator);
		case 'lt':
		case 'gte':
			if (!isNumber(actualValue) || !isNumber(valueToCompare)) {
				return false;
			}
			return Number(actualValue) < Number(valueToCompare) === ('lt' === operator);
		case 'in':
		case 'nin':
			if (!Array.isArray(valueToCompare)) {
				return false;
			}
			return valueToCompare.includes(actualValue) === ('in' === operator);
		case 'contains':
		case 'ncontains':
			if (
				('string' !== typeof actualValue || 'string' !== typeof valueToCompare) &&
				!Array.isArray(actualValue)
			) {
				return false;
			}
			const transformedValue = Array.isArray(actualValue)
				? actualValue.map((item) => (isTransformable(item) ? item.value : item))
				: actualValue;
			return ('contains' === operator) === transformedValue.includes(valueToCompare);
		case 'exists':
		case 'not_exist':
			const evaluation = !!actualValue || 0 === actualValue || false === actualValue;
			return ('exists' === operator) === evaluation;
		default:
			return true;
	}
}
function isNumber(value) {
	return typeof value === 'number' && !isNaN(value);
}
function getRelationMethod(relation) {
	switch (relation) {
		case 'or':
			return 'some';
		case 'and':
			return 'every';
		default:
			throw new Error(`Relation not supported ${relation}`);
	}
}
function extractValue(path, elementValues, nestedPath = []) {
	const extractedValue = path.reduce((acc, key, index) => {
		const value = acc?.[key];
		return index !== path.length - 1 && isTransformable(value) ? (value.value ?? null) : value;
	}, elementValues);
	if (!nestedPath?.length) {
		return extractedValue;
	}
	const nestedValue = nestedPath.reduce((acc, key) => acc?.[key], extractedValue?.value);
	return {
		$$type: 'unknown',
		value: nestedValue,
	};
}
function isDependency(term) {
	return 'terms' in term;
}

// src/utils/parse-html-children.ts
const INLINE_ELEMENTS = /* @__PURE__ */ new Set(['span', 'b', 'strong', 'i', 'em', 'u', 'a', 'del', 'sup', 'sub', 's']);
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
		let id = child.getAttribute('id');
		if (!id) {
			id = generateElementId();
			child.setAttribute('id', id);
		}
		const childElement = {
			id,
			type: tagName,
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
	const doc = parser.parseFromString(`<body>${html}</body>`, 'text/html');
	const parserError = doc.querySelector('parsererror');
	if (parserError) {
		console.warn('HTML parsing error, returning original content:', parserError.textContent);
		return { content: html, children: [] };
	}
	const body = doc.body;
	const children = traverseChildren(body);
	return {
		content: body.innerHTML,
		children,
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
	removeIntention,
};
// Annotate the CommonJS export names for ESM import in node:
0 &&
	(module.exports = {
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
		videoSrcPropTypeUtil,
	});
//# sourceMappingURL=index.js.map
