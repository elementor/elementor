import { type PropType } from '../types';
import { type JsonSchema7 } from '../utils/prop-json-schema';
import { ensureBuiltInLlmDialectAdapters } from './register-built-in-adapters';
import {
	applyLlmDialectSchema,
	finalizeLlmDialectSchema,
	type PropDialectAdapter,
	registerLlmDialectAdapter,
	registerLlmDialectSchemaFinalize,
} from './registry';
import { isLlmDialectSkip } from './skip';

export type SchemaGenerationContext = {
	readonly parentPropType?: PropType;
	readonly shapeKey?: string;
};

export type LlmDialectContext = {
	readonly propType: PropType;
	readonly schema?: JsonSchema7;
	readonly parentPropType?: PropType;
	readonly shapeKey?: string;
};

export type DialectPropAdapter = {
	toDialectSchema: (
		schema: JsonSchema7,
		propType: PropType,
		schemaContext?: SchemaGenerationContext
	) => JsonSchema7;
};

const dialectPropAdapter: DialectPropAdapter = {
	toDialectSchema( schema, propType, schemaContext = {} ) {
		const result = applyLlmDialectSchema( schema, {
			propType,
			parentPropType: schemaContext.parentPropType,
			shapeKey: schemaContext.shapeKey,
		} );
		const resolved = isLlmDialectSkip( result ) ? schema : result;
		return finalizeLlmDialectSchema( resolved );
	},
};

export const LLMDialectAdapter: DialectPropAdapter & {
	register: ( adapter: PropDialectAdapter ) => void;
	registerFinalizeSchema: ( hook: ( schema: JsonSchema7 ) => JsonSchema7 ) => void;
	finalizeLlmSchema: ( schema: JsonSchema7 ) => JsonSchema7;
} = {
	...dialectPropAdapter,
	register( adapter ) {
		ensureBuiltInLlmDialectAdapters();
		registerLlmDialectAdapter( adapter );
	},
	registerFinalizeSchema( hook ) {
		ensureBuiltInLlmDialectAdapters();
		registerLlmDialectSchemaFinalize( hook );
	},
	finalizeLlmSchema( schema ) {
		ensureBuiltInLlmDialectAdapters();
		return finalizeLlmDialectSchema( schema );
	},
	toDialectSchema( schema, propType, schemaContext = {} ) {
		ensureBuiltInLlmDialectAdapters();
		return dialectPropAdapter.toDialectSchema( schema, propType, schemaContext );
	},
};
