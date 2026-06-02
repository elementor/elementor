import { type JsonSchema7 } from '../utils/prop-json-schema';

const removeBindToProperty = (
	properties?: Record< string, JsonSchema7 >
): Record< string, JsonSchema7 > | undefined => {
	if ( ! properties || ! Object.hasOwn( properties, 'bindTo' ) ) {
		return properties;
	}

	const { bindTo: _bindTo, ...rest } = properties;

	return rest;
};

export const stripDynamicBinding = ( schema: JsonSchema7 ): JsonSchema7 => {
	const { allowBind: _allowBind, ...rest } = schema as JsonSchema7 & { allowBind?: boolean };

	if ( Array.isArray( rest.anyOf ) ) {
		return {
			...rest,
			anyOf: rest.anyOf.map( ( branch ) => ( {
				...branch,
				properties: removeBindToProperty( branch.properties ),
			} ) ),
		};
	}

	return { ...rest, properties: removeBindToProperty( rest.properties ) };
};
