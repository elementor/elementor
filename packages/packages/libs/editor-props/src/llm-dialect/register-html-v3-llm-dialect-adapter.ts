import { type PropType, type PropValue, type TransformablePropValue } from '../types';
import { type JsonSchema7 } from '../utils/prop-json-schema';
import { canonicalizeHtmlV3PropValue } from './html-v3-canonical-shape';
import { LLMDialectAdapter } from './llm-prop-schema';

const isHtmlV3PropTypeDefinition = ( propType: PropType ): boolean =>
	propType.kind === 'object' && 'key' in propType && propType.key === 'html-v3';

const stripBindToFromSchema = ( schema: JsonSchema7 ): JsonSchema7 => {
	const result = structuredClone( schema );
	delete result.allowBind;

	if ( result.properties?.bindTo ) {
		const { bindTo: _bindTo, ...remainingProperties } = result.properties;
		result.properties = remainingProperties;
	}

	if ( Array.isArray( result.anyOf ) ) {
		result.anyOf = result.anyOf.map( stripBindToFromSchema );
	}

	return result;
};

const sanitizeHtmlV3LlmSchema = ( schema: JsonSchema7 ): JsonSchema7 => {
	const result = structuredClone( schema );
	const contentSchema = result.properties?.value?.properties?.content as JsonSchema7 | undefined;

	if ( ! contentSchema ) {
		return result;
	}

	let sanitizedContent = stripBindToFromSchema( contentSchema );

	if ( Array.isArray( sanitizedContent.anyOf ) ) {
		sanitizedContent = {
			...sanitizedContent,
			anyOf: sanitizedContent.anyOf.filter( ( branch ) => branch.properties?.$$type?.const === 'string' ),
		};
	}

	if ( result.properties?.value?.properties ) {
		result.properties.value.properties.content = sanitizedContent;
	}

	return result;
};

export function registerHtmlV3LLMDialectAdapter() {
	LLMDialectAdapter.registerSchemaDialect( {
		id: 'html-v3',
		matches: isHtmlV3PropTypeDefinition,
		toDialectSchema: ( schema ) => sanitizeHtmlV3LlmSchema( schema ),
	} );

	LLMDialectAdapter.register( 'html-v3', {
		toPropValue: ( propValue ) =>
			canonicalizeHtmlV3PropValue( propValue as PropValue ) as TransformablePropValue< string, unknown >,
		toDialectValue: ( propValue ) =>
			canonicalizeHtmlV3PropValue( propValue as PropValue ) as TransformablePropValue< string, unknown >,
	} );
}
