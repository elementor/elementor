import { createTransformer, settingsTransformersRegistry, type TransformerOptions } from '@elementor/editor-canvas';
import { type PropValue, type TransformablePropValue } from '@elementor/editor-props';

import { type ComponentOverridable } from './types';

export const componentOverridableTransformer = createTransformer(
	( value: ComponentOverridable, options: TransformerOptions ) => {
		const { overrides } = options.renderContext ?? {};

		const originValue = normalizeOriginValue( value.origin_value );
		const overrideValue = overrides?.[ value.override_key as keyof typeof overrides ];

		if ( overrideValue ) {
			if ( isOriginValueOverride( originValue ) ) {
				return transformOverride( originValue, options, overrideValue );
			}

			return overrideValue;
		}

		return originValue;
	}
);

/**
 * Mirrors `Overridable_Prop_Type::normalize_origin_value()` on the PHP side. Rendering resolves
 * props without validating them, so an empty origin value written by an older editor reaches this
 * transformer untouched until the document is next saved.
 */
function normalizeOriginValue( originValue: ComponentOverridable[ 'origin_value' ] ) {
	const isEmpty = !! originValue && Object.keys( originValue ).length === 0;

	return isEmpty ? null : originValue;
}

function transformOverride(
	originValue: TransformablePropValue< string >,
	options: {
		key: string;
	},
	overrideValue: PropValue
) {
	const transformer = settingsTransformersRegistry.get( 'override' );

	if ( ! transformer ) {
		return null;
	}

	const transformedValue = transformer( originValue.value, options );

	if ( ! transformedValue ) {
		return null;
	}

	const [ key ] = Object.keys( transformedValue as Record< string, unknown > );

	return {
		[ key ]: overrideValue,
	};
}

function isOriginValueOverride(
	originValue: TransformablePropValue< string > | null
): originValue is TransformablePropValue< string > {
	return originValue?.$$type === 'override';
}
