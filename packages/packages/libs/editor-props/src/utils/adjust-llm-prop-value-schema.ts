import { htmlV3ToDynamicFallback } from '../llm-dialect/html-v3-dynamic-fallback';
import { canonicalizeSizePropValue } from '../llm-dialect/size-canonical-shape';
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
	// Check for transformable types
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

	// fix by type - Size is the only case where we have a non-valid structure
	switch ( transformablePropValue.$$type ) {
		case 'dynamic': {
			const dynamicValue = (
				transformablePropValue as TransformablePropValue<
					'dynamic',
					{
						name: string;
						group?: string;
						settings?: Record< string, unknown >;
					}
				>
			 ).value;

			if ( dynamicValue?.settings?.fallback ) {
				dynamicValue.settings.fallback = htmlV3ToDynamicFallback( dynamicValue.settings.fallback as PropValue );
			}
			break;
		}
		case 'size':
			return canonicalizeSizePropValue( transformablePropValue as PropValue );
		case 'html-v3': {
			const { value: rawHtmlV3PropValue } = transformablePropValue as TransformablePropValue<
				string,
				{ content: PropValue; children: PropValue[] }
			>;
			return {
				$$type: 'html-v3',
				value: {
					content: rawHtmlV3PropValue.content,
					children: rawHtmlV3PropValue.children ?? [],
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
			clonedObject.value = { ...objectValue };
			Object.entries( objectValue ).forEach( ( [ key, childProp ] ) => {
				if ( isTransformablePropValue( childProp ) ) {
					clonedObject.value[ key ] = adjustLlmPropValueSchema( childProp as PropValue, { transformers } );
					return;
				}
				if ( typeof childProp !== 'object' || childProp === null || Array.isArray( childProp ) ) {
					return;
				}
				clonedObject.value[ key ] = Object.fromEntries(
					Object.entries( childProp as Record< string, unknown > ).map( ( [ nestedKey, nestedValue ] ) => [
						nestedKey,
						isTransformablePropValue( nestedValue )
							? adjustLlmPropValueSchema( nestedValue as PropValue, { transformers } )
							: nestedValue,
					] )
				);
			} );
		}
	}
	return clone;
};
