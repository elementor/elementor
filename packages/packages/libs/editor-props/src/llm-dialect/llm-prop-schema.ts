import { type PropType } from '../types';
import { type JsonSchema7 } from '../utils/prop-json-schema';
import { ensureBuiltInLlmDialectAdapters } from './init';
import {
	applyLlmDialectSchema,
	finalizeLlmDialectSchema,
	isLlmDialectSkip,
	type PropDialectAdapter,
	type PropDialectContext,
	registerLlmDialectAdapter,
	registerLlmDialectSchemaFinalize,
} from './registry';

export type SchemaGenerationContext = Pick< PropDialectContext, 'parentPropType' | 'shapeKey' >;
export type DialectPropAdapter = {
	toDialectSchema: (
		schema: JsonSchema7,
		propType: PropType,
		schemaContext?: SchemaGenerationContext
	) => JsonSchema7;
};

export const LLMDialectAdapter: DialectPropAdapter & {
	register: ( adapter: PropDialectAdapter ) => void;
	registerFinalizeSchema: ( hook: ( schema: JsonSchema7 ) => JsonSchema7 ) => void;
	finalizeLlmSchema: ( schema: JsonSchema7 ) => JsonSchema7;
} = {
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
		const result = applyLlmDialectSchema( schema, {
			propType,
			parentPropType: schemaContext.parentPropType,
			shapeKey: schemaContext.shapeKey,
		} );
		const resolved = isLlmDialectSkip( result ) ? schema : result;
		return finalizeLlmDialectSchema( resolved );
	},
};
