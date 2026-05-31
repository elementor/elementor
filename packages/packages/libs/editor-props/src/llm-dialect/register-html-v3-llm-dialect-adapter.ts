import { LLMDialectAdapter } from './llm-prop-schema';
import { isHtmlV3PropTypeDefinition } from './prop-type-schema-matchers';
import { sanitizeHtmlV3LlmSchema } from './sanitize-html-v3-llm-schema';

export function registerHtmlV3LLMDialectAdapter() {
	LLMDialectAdapter.registerSchemaDialect( {
		id: 'html-v3',
		matches: isHtmlV3PropTypeDefinition,
		toDialectSchema: ( schema ) => sanitizeHtmlV3LlmSchema( schema ),
	} );
}
