import { type TransformablePropType } from '@elementor/editor-props';

export function createMockSingleSizeFilterPropType() {
	return {
		'css-filter-func': {
			kind: 'object',
			key: 'css-filter-func',
			default: null,
			meta: {},
			settings: {},
			shape: {
				func: {
					kind: 'plain',
					key: 'string',
					default: null,
					meta: {},
					settings: {
						required: true,
						enum: [
							'blur',
							'brightness',
							'contrast',
							'grayscale',
							'invert',
							'sepia',
							'saturate',
							'hue-rotate',
						],
					},
				},
				args: {
					kind: 'union',
					prop_types: {
						blur: {
							key: 'blur',
							kind: 'object',
							shape: {
								size: createSizePropType(),
							},
						},
						intensity: {
							key: 'blur',
							kind: 'object',
							shape: {
								size: createSizePropType(),
							},
						},
						'color-tone': {
							key: 'blur',
							kind: 'object',
							shape: {
								size: createSizePropType(),
							},
						},
						'hue-rotate': {
							key: 'blur',
							kind: 'object',
							shape: {
								size: createSizePropType(),
							},
						},
					},
				},
			},
		},
	} as unknown as Record< string, TransformablePropType >;
}

function createSizePropType() {
	return {
		key: 'size',
		kind: 'object',
		shape: {
			size: {
				kind: 'plain',
				key: 'number',
				default: null,
				meta: {},
				settings: {},
			},
			unit: {
				kind: 'plain',
				key: 'string',
				default: null,
				meta: {},
				settings: {
					enum: [ 'px', 'em', 'rem', '%', 'vh', 'vw', 'vmin', 'vmax', 'deg', 'rad', 'grad', 'turn' ],
					required: true,
				},
			},
		},
	};
}
