import { type AnyTransformable, type PropType, type PropValue } from '../types';
import { type JsonSchema7 } from '../utils/prop-json-schema';
import { isLlmDialectSkip, LLM_DIALECT_SKIP, type LlmDialectSkip } from './skip';

export type PropDialectContext = {
	readonly propType: PropType;
	readonly schema?: JsonSchema7;
	readonly parentPropType?: PropType;
	readonly shapeKey?: string;
};

export type PropDialectAdapter = {
	id: string;
	matches: ( ctx: PropDialectContext ) => boolean;
	toDialectSchema?: ( schema: JsonSchema7, ctx: PropDialectContext ) => JsonSchema7 | LlmDialectSkip;
	toPropValue?: ( value: AnyTransformable, ctx: PropDialectContext ) => PropValue | LlmDialectSkip;
	toDialectValue?: ( value: AnyTransformable, ctx: PropDialectContext ) => PropValue | LlmDialectSkip;
};

type SchemaFinalizeHook = ( schema: JsonSchema7 ) => JsonSchema7;

const adapters: PropDialectAdapter[] = [];
let schemaFinalizeHook: SchemaFinalizeHook | undefined;

export const registerLlmDialectAdapter = ( adapter: PropDialectAdapter ): void => {
	if ( adapters.some( ( existing ) => existing.id === adapter.id ) ) {
		throw new Error( `Duplicate LLM dialect registration: "${ adapter.id }".` );
	}

	adapters.push( adapter );
};

export const registerLlmDialectSchemaFinalize = ( hook: SchemaFinalizeHook ): void => {
	if ( schemaFinalizeHook ) {
		throw new Error( 'Duplicate LLM schema finalize registration.' );
	}

	schemaFinalizeHook = hook;
};

export const getLlmDialectAdapters = (): readonly PropDialectAdapter[] => adapters;

export const getMatchingLlmDialectAdapters = ( ctx: PropDialectContext ): PropDialectAdapter[] =>
	adapters.filter( ( adapter ) => adapter.matches( ctx ) );

export const applyLlmDialectSchema = ( schema: JsonSchema7, ctx: PropDialectContext ): JsonSchema7 | LlmDialectSkip => {
	let result = schema;

	for ( const adapter of getMatchingLlmDialectAdapters( ctx ) ) {
		if ( ! adapter.toDialectSchema ) {
			continue;
		}

		const next = adapter.toDialectSchema( result, ctx );
		if ( isLlmDialectSkip( next ) ) {
			return LLM_DIALECT_SKIP;
		}

		result = next;
	}

	return result;
};

export const applyLlmDialectPropValue = (
	value: PropValue,
	ctx: PropDialectContext,
	direction: 'toProp' | 'toDialect'
): PropValue | LlmDialectSkip => {
	let result = value;

	for ( const adapter of getMatchingLlmDialectAdapters( ctx ) ) {
		const hook = direction === 'toProp' ? adapter.toPropValue : adapter.toDialectValue;
		if ( ! hook ) {
			continue;
		}

		const next = hook( result, ctx );
		if ( isLlmDialectSkip( next ) ) {
			return LLM_DIALECT_SKIP;
		}

		result = next;
	}

	return result;
};

export const finalizeLlmDialectSchema = ( schema: JsonSchema7 ): JsonSchema7 =>
	schemaFinalizeHook ? schemaFinalizeHook( schema ) : schema;

export const resetLlmDialectRegistryForTests = (): void => {
	adapters.length = 0;
	schemaFinalizeHook = undefined;
};
