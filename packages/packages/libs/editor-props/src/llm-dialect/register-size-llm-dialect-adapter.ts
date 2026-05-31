import { flattenSizeLlmSchema } from './flatten-size-llm-schema';
import { LLMDialectAdapter } from './llm-prop-schema';
import { isSizePropTypeDefinition } from './prop-type-schema-matchers';
import { canonicalizeSizePropValue } from './size-canonical-shape';

export function registerSizeLLMDialectAdapter() {
	LLMDialectAdapter.registerSchemaDialect( {
		id: 'size',
		matches: isSizePropTypeDefinition,
		toDialectSchema: ( schema, propType ) => flattenSizeLlmSchema( schema, propType ),
	} );

	LLMDialectAdapter.register( 'size', {
		toPropValue: ( propValue ) => canonicalizeSizePropValue( propValue ),
		toDialectValue: ( propValue ) => canonicalizeSizePropValue( propValue ),
	} );
}
