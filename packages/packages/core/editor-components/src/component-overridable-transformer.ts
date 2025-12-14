import { createTransformer, settingsTransformersRegistry } from '@elementor/editor-canvas';
import { type TransformablePropValue } from '@elementor/editor-props';

import { componentInstanceContext } from './component-instance-transformer';
import { type ComponentOverridable } from './types';

export const componentOverridableTransformer = createTransformer(
	async ( value: ComponentOverridable, options: { key: string } ) => {
		const { overrides } = componentInstanceContext.get();

		const overrideValue = overrides?.[ value.override_key ];

		if ( overrideValue ) {
			const isOverride = isOriginValueOverride( value.origin_value );

			if ( isOverride ) {
				return await transformOverride( value, options, overrideValue );
			}

			return overrideValue;
		}

		return value.origin_value;
	}
);

async function transformOverride(
	value: ComponentOverridable,
	options: {
		key: string;
	},
	overrideValue: unknown
): Promise< unknown > {
	const transformer = settingsTransformersRegistry.get( 'override' );

	if ( ! transformer ) {
		return null;
	}

	const transformedValue = await transformer( value.origin_value.value, options );

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
