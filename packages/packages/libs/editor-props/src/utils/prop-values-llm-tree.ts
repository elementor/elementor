import { LLMDialectAdapter, type LlmDialectValueContext } from '../llm-dialect/llm-prop-schema';
import { initLlmDialect } from '../llm-dialect/init';
import { type ObjectPropType, type PropType, type PropValue, type TransformablePropValue } from '../types';

export type PropToLlmOptions = LlmDialectValueContext;

export const ensureLlmDialect = () => {
	initLlmDialect();
};

export const isTransformablePropValue = ( value: unknown ): value is TransformablePropValue< string, unknown > =>
	typeof value === 'object' && value !== null && '$$type' in value;

const getChildPropType = ( propType: PropType | undefined, key: string ): PropType | undefined => {
	if ( ! propType || propType.kind !== 'object' ) {
		return undefined;
	}

	return ( propType as ObjectPropType ).shape?.[ key ];
};

export const applyDialectFromTree = (
	value: unknown,
	context: LlmDialectValueContext = {}
): unknown => {
	if ( Array.isArray( value ) ) {
		return value.map( ( item ) => applyDialectFromTree( item, context ) );
	}

	if ( ! isTransformablePropValue( value ) ) {
		return value;
	}

	const dialectValue = LLMDialectAdapter.toDialectValue(
		structuredClone( value ),
		context
	) as TransformablePropValue< string, unknown >;
	const nestedValue = dialectValue.value;

	if ( nestedValue === null || typeof nestedValue !== 'object' ) {
		return dialectValue;
	}

	if ( Array.isArray( nestedValue ) ) {
		dialectValue.value = nestedValue.map( ( item ) => applyDialectFromTree( item, context ) );
		return dialectValue;
	}

	dialectValue.value = Object.fromEntries(
		Object.entries( nestedValue ).map( ( [ key, childValue ] ) => [
			key,
			applyDialectFromTree( childValue, { propType: getChildPropType( context.propType, key ) } ),
		] )
	);
	return dialectValue;
};

export const applyDialectToTree = ( value: unknown ): unknown => {
	if ( ! isTransformablePropValue( value ) ) {
		return value;
	}

	return LLMDialectAdapter.toPropValue( structuredClone( value ) );
};
