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
							key: 'intensity',
							kind: 'object',
							shape: {
								size: createSizePropType(),
							},
						},
						'color-tone': {
							key: 'color-tone',
							kind: 'object',
							shape: {
								size: createSizePropType(),
							},
						},
						'hue-rotate': {
							key: 'hue-rotate',
							kind: 'object',
							shape: {
								size: createSizePropType(),
							},
						},
						'drop-shadow': {
							key: 'drop-shadow',
							kind: 'object',
							shape: {
								xAxis: createSizePropType(),
								yAxis: createSizePropType(),
								blur: createSizePropType(),
								color: {
									kind: 'plain',
									key: 'color',
									default: {
										$$type: 'color',
										value: 'rgba(0, 0, 0, 1)',
									},
									meta: {},
								},
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
