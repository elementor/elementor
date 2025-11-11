import { numberPropTypeUtil, type NumberPropValue, stringPropTypeUtil, type StringPropValue } from '../prop-types';
import { type ObjectPropValue, type PropValue, type TransformablePropValue } from '../types';

const ensureNotNull = ( v: unknown, fallback: unknown ) => ( v === null ? fallback : v );

export const adjustLlmPropValueSchema = ( value: Readonly< PropValue >, forceKey?: string ): PropValue => {
	const clone = structuredClone( value );
	// Check for transformable types
	if ( clone && typeof clone === 'object' ) {
		if ( Array.isArray( clone ) ) {
			return clone.map( ( item ) => adjustLlmPropValueSchema( item, forceKey ) ) as PropValue;
		}
		const transformablePropValue = clone as TransformablePropValue< string >;
		if ( forceKey ) {
			if ( transformablePropValue.$$type && transformablePropValue.$$type !== forceKey ) {
				throw new Error(
					`Conflicting $$type in property. Expected: ${ forceKey }, Found: ${ transformablePropValue.$$type }`
				);
			}
			transformablePropValue.$$type = forceKey;
		}

		if ( ! transformablePropValue.$$type ) {
			throw new Error( 'Missing $$type in property: ' + JSON.stringify( transformablePropValue ) );
		}

		// validate structure
		if ( Object.keys( transformablePropValue ).length !== 2 ) {
			throw (
				new Error( 'Invalid structure for PropValue: ' + JSON.stringify( transformablePropValue ) ) +
				'\nStrcuture must include only $$type and value properties.'
			);
		}
		if ( ! ( 'value' in transformablePropValue ) ) {
			throw new Error( 'Missing value property in PropValue: ' + JSON.stringify( transformablePropValue ) );
		}

		// fix by type
		switch ( transformablePropValue.$$type ) {
			case 'size': {
				const { value: rawSizePropValue } = transformablePropValue as TransformablePropValue<
					string,
					{ size: StringPropValue | NumberPropValue; unit: StringPropValue }
				>;
				const unit = rawSizePropValue.unit.value;
				const size =
					typeof rawSizePropValue.size === 'string' || typeof rawSizePropValue.size === 'number'
						? rawSizePropValue.size
						: ensureNotNull(
								stringPropTypeUtil.extract( rawSizePropValue.size ),
								numberPropTypeUtil.extract( rawSizePropValue.size )
						  );
				return {
					$$type: 'size',
					value: {
						unit,
						size,
					},
				};
			}
		}

		if ( typeof transformablePropValue.value === 'object' ) {
			if ( Array.isArray( transformablePropValue.value ) ) {
				transformablePropValue.value = adjustLlmPropValueSchema(
					transformablePropValue.value,
					undefined
				) as PropValue[];
			} else {
				const { value: objectValue } = transformablePropValue as ObjectPropValue;
				Object.keys( objectValue ).forEach( ( key ) => {
					const childProp = ( objectValue as Record< string, unknown > )[ key ];
					( transformablePropValue.value as Record< string, unknown > )[ key ] = adjustLlmPropValueSchema(
						childProp as PropValue,
						undefined
					);
				} );
			}
			return transformablePropValue;
		}
	}
	return clone;
};
