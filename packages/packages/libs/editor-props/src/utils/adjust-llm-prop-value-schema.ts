import { type PropValue, type TransformablePropValue } from '../types';
import { isTransformable } from './is-transformable';

type PropConverter = ( value: unknown ) => PropValue;

export const applyGlobalVariableResolvers = (
	value: PropValue,
	transformers: Record< string, PropConverter > = {}
): PropValue => {
	if ( ! isTransformable( value ) ) {
		return value;
	}

	const transformer = transformers[ value.$$type ];

	if ( transformer ) {
		return transformer( value.value );
	}

	if ( Array.isArray( value.value ) ) {
		return {
			...value,
			value: value.value.map( ( item ) => applyGlobalVariableResolvers( item as PropValue, transformers ) ),
		};
	}

	if ( typeof value.value === 'object' && value.value !== null ) {
		return {
			...value,
			value: Object.fromEntries(
				Object.entries( value.value as Record< string, PropValue > ).map( ( [ key, childValue ] ) => [
					key,
					applyGlobalVariableResolvers( childValue, transformers ),
				] )
			),
		};
	}

	return value;
};

export const stripIntentionFromPropValue = ( value: PropValue ): PropValue => {
	if ( ! isTransformable( value ) ) {
		return value;
	}

	const transformablePropValue = value as TransformablePropValue< string, unknown >;

	if ( ! ( '$intention' in transformablePropValue ) ) {
		return value;
	}

	const { $intention: _intention, ...rest } = transformablePropValue as Record< string, unknown >;
	return rest as PropValue;
};
