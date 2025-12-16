import { numberPropTypeUtil, type NumberPropValue, stringPropTypeUtil, type StringPropValue } from '../prop-types';
import { type ObjectPropValue, type PropValue, type TransformablePropValue } from '../types';

const ensureNotNull = ( v: unknown, fallback: unknown ) => ( v === null ? fallback : v );

type PropConverter = ( value: unknown ) => PropValue;

type Options = {
	forceKey?: string;
	transformers?: Record< string, PropConverter >;
};

const defaultOptions: Options = {
	transformers: {},
};

export const adjustLlmPropValueSchema = (
	value: Readonly< PropValue >,
	{ transformers = {}, forceKey = undefined }: Options = defaultOptions
): PropValue => {
	const clone = structuredClone( value );
	if ( typeof clone !== 'object' || clone === null ) {
		return null;
	}
	// Check for transformable types
	if ( Array.isArray( clone ) ) {
		return clone.map( ( item ) => adjustLlmPropValueSchema( item, { forceKey, transformers } ) ) as PropValue;
	}
	const transformablePropValue = clone as TransformablePropValue< string >;
	if ( forceKey ) {
		transformablePropValue.$$type = forceKey;
	}

	// fix by type - Size is the only case where we have a non-valid structure
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
		default:
			const transformer = transformers?.[ transformablePropValue.$$type ];
			if ( transformer ) {
				return transformer( transformablePropValue.value );
			}
	}

	if ( typeof transformablePropValue.value === 'object' ) {
		if ( Array.isArray( transformablePropValue.value ) ) {
			transformablePropValue.value = adjustLlmPropValueSchema( transformablePropValue.value, {
				transformers,
			} ) as PropValue[];
		} else {
			const { value: objectValue } = transformablePropValue as ObjectPropValue;
			const clonedObject = clone as ObjectPropValue;
			clonedObject.value = {} as ( typeof clonedObject )[ 'value' ]; // Record< string, PropValue >;
			Object.entries( objectValue ).forEach( ( [ key, childProp ] ) => {
				clonedObject.value[ key ] = adjustLlmPropValueSchema( childProp as PropValue, { transformers } );
			} );
		}
	}
	return clone;
};
