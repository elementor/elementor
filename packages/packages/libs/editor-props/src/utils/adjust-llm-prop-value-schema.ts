import { LLMDialectAdapter } from '../llm-dialect/llm-prop-schema';
import { type ObjectPropValue, type PropValue, type TransformablePropValue } from '../types';

type PropConverter = ( value: unknown ) => PropValue;

type Options = {
	forceKey?: string;
	transformers?: Record< string, PropConverter >;
};

const defaultOptions: Options = {
	transformers: {},
};

const isTransformablePropValue = ( value: unknown ): value is TransformablePropValue< string, unknown > =>
	typeof value === 'object' && value !== null && '$$type' in value;

export const adjustLlmPropValueSchema = (
	value: Readonly< PropValue >,
	{ transformers = {}, forceKey = undefined }: Options = defaultOptions
): PropValue => {
	const clone = structuredClone( value );
	if ( typeof clone !== 'object' || clone === null ) {
		return null;
	}
	if ( Array.isArray( clone ) ) {
		return clone.map( ( item ) => adjustLlmPropValueSchema( item, { forceKey, transformers } ) ) as PropValue;
	}
	const transformablePropValue = clone as TransformablePropValue< string >;
	if ( '$intention' in transformablePropValue ) {
		delete ( transformablePropValue as Record< string, unknown > ).$intention;
	}
	if ( forceKey && transformablePropValue.$$type !== 'dynamic' ) {
		transformablePropValue.$$type = forceKey;
	}

	const transformer = transformers?.[ transformablePropValue.$$type ];
	if ( transformer ) {
		return transformer( transformablePropValue.value );
	}

	if ( typeof transformablePropValue.value === 'object' ) {
		if ( Array.isArray( transformablePropValue.value ) ) {
			transformablePropValue.value = adjustLlmPropValueSchema( transformablePropValue.value, {
				transformers,
			} ) as PropValue[];
		} else {
			const { value: objectValue } = transformablePropValue as ObjectPropValue;
			const clonedObject = clone as ObjectPropValue;
			clonedObject.value = { ...objectValue };
			Object.entries( objectValue ).forEach( ( [ key, childProp ] ) => {
				if ( isTransformablePropValue( childProp ) ) {
					clonedObject.value[ key ] = adjustLlmPropValueSchema(
						LLMDialectAdapter.applyRegisteredTypeDialect( childProp ) as PropValue,
						{ transformers }
					);
					return;
				}
				if ( typeof childProp !== 'object' || childProp === null || Array.isArray( childProp ) ) {
					return;
				}
				clonedObject.value[ key ] = Object.fromEntries(
					Object.entries( childProp as Record< string, unknown > ).map( ( [ nestedKey, nestedValue ] ) => [
						nestedKey,
						isTransformablePropValue( nestedValue )
							? adjustLlmPropValueSchema(
									LLMDialectAdapter.applyRegisteredTypeDialect( nestedValue ) as PropValue,
									{ transformers }
							  )
							: nestedValue,
					] )
				);
			} );
		}
	}
	return clone;
};
