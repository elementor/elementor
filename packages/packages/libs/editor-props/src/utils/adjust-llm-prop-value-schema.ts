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
			transformablePropValue.$$type = forceKey;
		}

		if ( ! transformablePropValue.$$type ) {
			throw new Error( 'Missing $$type in property: ' + JSON.stringify( transformablePropValue ) );
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
				const unit =
					typeof rawSizePropValue.unit === 'string'
						? rawSizePropValue.unit
						: ensureNotNull( stringPropTypeUtil.extract( rawSizePropValue.unit ), 'px' );
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
				const clonedObject = clone as ObjectPropValue;
				clonedObject.value = {} as Record< string, PropValue >;
				Object.keys( objectValue ).forEach( ( key ) => {
					const childProp = ( objectValue as Record< string, unknown > )[ key ];
					( clonedObject.value as Record< string, unknown > )[ key ] = adjustLlmPropValueSchema(
						childProp as PropValue,
						undefined
					);
				} );
			}
		}
	}
	return clone;
};
