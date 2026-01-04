import { createTransformer, settingsTransformersRegistry, type TransformerOptions } from '@elementor/editor-canvas';
import { type PropValue, type TransformablePropValue } from '@elementor/editor-props';

import { type ComponentOverridable } from './types';

export const componentOverridableTransformer = createTransformer(
	( value: ComponentOverridable, options: TransformerOptions ) => {
		const { overrides } = options.renderContext ?? {};

		const overrideValue = overrides?.[ value.override_key ];

		if ( overrideValue ) {
			const isOverride = isOriginValueOverride( value.origin_value );

			if ( isOverride ) {
				return transformOverride( value, options, overrideValue );
			}

			return overrideValue;
		}

		return value.origin_value;
	}
);

function transformOverride(
	value: ComponentOverridable,
	options: {
		key: string;
	},
	overrideValue: PropValue
) {
	const transformer = settingsTransformersRegistry.get( 'override' );

	if ( ! transformer ) {
		return null;
	}

	const transformedValue = transformer( value.origin_value.value, options );

	if ( ! transformedValue ) {
		return null;
	}

	const [ key ] = Object.keys( transformedValue as Record< string, unknown > );

	return {
		[ key ]: overrideValue,
	};
}

function isOriginValueOverride( originValue: TransformablePropValue< string > ): boolean {
	return originValue.$$type === 'override';
}
