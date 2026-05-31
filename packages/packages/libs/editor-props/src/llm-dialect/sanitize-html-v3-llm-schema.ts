import { type JsonSchema7 } from '../utils/prop-json-schema';

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

export const sanitizeHtmlV3LlmSchema = ( schema: JsonSchema7 ): JsonSchema7 => {
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

	result.properties.value.properties.content = sanitizedContent;
	return result;
};
