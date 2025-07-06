import { type TransformablePropType } from '@elementor/editor-props';

export function createMockSingleSizeFilterPropType( name: string, propName: string, units: string[] ) {
	return {
		[ name ]: {
			kind: 'object',
			key: name,
			default: null,
			meta: {},
			settings: {},
			shape: {
				[ propName ]: {
					kind: 'object',
					key: 'size',
					default: null,
					meta: {},
					settings: {},
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
								enum: units,
								required: true,
							},
						},
					},
				},
			},
		},
	} as unknown as Record< string, TransformablePropType >;
}
