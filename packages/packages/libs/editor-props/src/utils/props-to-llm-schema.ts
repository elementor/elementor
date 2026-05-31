import {
	type DialectPropAdapter,
	LLMDialectAdapter,
	type LlmDialectSchemaContext,
} from '../llm-dialect/llm-prop-schema';
import { type PropsSchema, type PropType } from '../types';
import { type JsonSchema7 } from './prop-json-schema';

const nestedLlmSchemaContext = ( context?: LlmDialectSchemaContext ): LlmDialectSchemaContext | undefined => {
	if ( ! context || context.allowBindTo === false ) {
		return context;
	}

	return { allowBindTo: false };
};

export function propTypeToLlmJsonSchema(
	propType: PropType,
	context: LlmDialectSchemaContext = { allowBindTo: true }
): JsonSchema7 {
	return propTypeToJsonSchema( propType, LLMDialectAdapter, context );
}

export function propTypeToJsonSchema(
	propType: PropType,
	dialect?: DialectPropAdapter,
	context?: LlmDialectSchemaContext
): JsonSchema7 {
	const description = propType.meta?.description;

	const schema: JsonSchema7 = {};

	if ( description ) {
		schema.description = description;
	}

	// Add example from initial_value if it exists
	if ( propType.initial_value !== null && propType.initial_value !== undefined ) {
		schema.examples = [ propType.initial_value ];
	}

	// Handle different kinds of prop types
	switch ( propType.kind ) {
		case 'union':
			return convertUnionPropType( propType, schema, dialect, context );
		case 'object':
			return convertObjectPropType( propType, schema, dialect, context );
		case 'array':
			return convertArrayPropType( propType, schema, dialect, context );
		default:
			const result = convertPlainPropType( propType, schema );
			return dialect ? dialect.toDialectSchema( result, propType, context ) : result;
	}
}

function convertPlainPropType(
	propType: PropType & { key: string; kind: string },
	baseSchema: JsonSchema7
): JsonSchema7 {
	const schema = { ...baseSchema };

	// This could happen when data is malformed due to a bug, added this as a safeguard.
	if ( ! Object.hasOwn( propType, 'kind' ) ) {
		throw new Error( `PropType kind is undefined for propType with key: ${ propType.key ?? '[unknown key]' }` );
	}

	const enumValues = ( propType.settings?.enum || [] ) as string[] | number[];

	switch ( propType.kind ) {
		case 'string':
		case 'number':
		case 'boolean':
			return {
				...schema,
				type: 'object',
				properties: {
					$$type: {
						type: 'string',
						const: propType.key ?? propType.kind,
					},
					value: {
						type: propType.kind,
						...( enumValues.length > 0 ? { enum: enumValues } : {} ),
					},
				},
				required: [ '$$type', 'value' ],
			};
		default:
			return {
				...schema,
				type: 'object',
				$$type: propType.kind,
				value: {
					type: propType.kind,
				},
			};
	}
}

/**
 * Converts a union prop type to JSON Schema ( электричество anyOf)
 *
 * @param propType   The union prop type to convert
 * @param baseSchema Base schema to extend
 * @param dialect
 * @param context
 */
function convertUnionPropType(
	propType: PropType & { kind: 'union' },
	baseSchema: JsonSchema7,
	dialect?: DialectPropAdapter,
	context?: LlmDialectSchemaContext
): JsonSchema7 {
	const schema = structuredClone( baseSchema );

	const propTypes = propType.prop_types || {};
	const schemas: JsonSchema7[] = [];

	for ( const [ typeKey, subPropType ] of Object.entries( propTypes ) ) {
		if ( typeKey === 'overridable' || ( typeKey === 'dynamic' && dialect ) ) {
			continue;
		}
		const subSchema = convertPropTypeToJsonSchema( subPropType, dialect, context );
		schemas.push( subSchema );
	}

	if ( schemas.length > 0 ) {
		schema.anyOf = schemas;
	}

	const propTypeDescription = propType.meta?.description;
	if ( propTypeDescription ) {
		schema.description = propTypeDescription;
	}
	return dialect ? dialect.toDialectSchema( schema, propType, context ) : schema;
}

function convertObjectPropType(
	propType: PropType & { kind: 'object' },
	baseSchema: JsonSchema7,
	dialect?: DialectPropAdapter,
	context?: LlmDialectSchemaContext
): JsonSchema7 {
	const schema = structuredClone( baseSchema );

	schema.type = 'object';
	const internalStructure: {
		properties: {
			$$type: JsonSchema7;
			value: JsonSchema7;
		};
	} = {
		properties: {
			$$type: {
				type: 'string',
				const: propType.key,
			},
			value: {
				type: 'object',
				properties: {} as Record< string, JsonSchema7 >,
				additionalProperties: false,
			},
		},
	};

	const required: string[] = [ '$$type', 'value' ];
	const valueRequired: string[] = [];

	const shape = propType.shape || {};
	const nestedContext = nestedLlmSchemaContext( context );

	for ( const [ key, subPropType ] of Object.entries( shape ) ) {
		const propSchema = propTypeToJsonSchema( subPropType, dialect, nestedContext );

		if ( subPropType.settings?.required === true ) {
			valueRequired.push( key );
		}

		if ( internalStructure.properties.value.properties ) {
			internalStructure.properties.value.properties[ key ] = propSchema;
		}
	}

	if ( valueRequired.length > 0 ) {
		internalStructure.properties.value.required = valueRequired;
	}

	const mergedSchema: JsonSchema7 = {
		...schema,
		required,
		properties: internalStructure.properties,
	};

	return dialect ? dialect.toDialectSchema( mergedSchema, propType, context ) : mergedSchema;
}

function convertArrayPropType(
	propType: PropType & { kind: 'array' },
	baseSchema: JsonSchema7,
	dialect?: DialectPropAdapter,
	context?: LlmDialectSchemaContext
): JsonSchema7 {
	const schema = structuredClone( baseSchema );

	schema.type = 'object';
	let items: unknown;

	const itemPropType = propType.item_prop_type;

	if ( itemPropType ) {
		items = convertPropTypeToJsonSchema( itemPropType, dialect, nestedLlmSchemaContext( context ) );
	}

	schema.properties = {
		$$type: {
			type: 'string',
			const: propType.key,
		},
		value: {
			type: 'array',
			...( items ? { items } : {} ),
		} as JsonSchema7,
	};
	return dialect ? dialect.toDialectSchema( schema, propType, context ) : schema;
}

function convertPropTypeToJsonSchema(
	propType: PropType,
	dialect?: DialectPropAdapter,
	context?: LlmDialectSchemaContext
): JsonSchema7 {
	return propTypeToJsonSchema( propType, dialect, context );
}

export const nonConfigurablePropKeys = [ '_cssid', 'classes', 'attributes' ] as readonly string[];

export function isPropKeyConfigurable( propKey: string, propType?: PropType ): boolean {
	if ( ! nonConfigurablePropKeys.includes( propKey ) ) {
		return true;
	}
	return !! ( ! Array.isArray( propType?.meta ) && propType?.meta?.llm_configurable );
}

export function configurableKeys( schema: PropsSchema ): string[] {
	return Object.keys( schema ).filter( ( key ) => isPropKeyConfigurable( key, schema[ key ] ) );
}

export function enrichWithIntention(
	jsonSchema: JsonSchema7,
	text: string = 'Describe the desired outcome'
): JsonSchema7 {
	const result = structuredClone( jsonSchema );
	if ( ! result.properties ) {
		return jsonSchema;
	}
	result.properties.$intention = {
		type: 'string',
		description: text,
	};
	result.required = [ ...( result.required || [] ), '$intention' ];
	return result;
}

export function removeIntention( jsonSchema: JsonSchema7 ): JsonSchema7 {
	const result = structuredClone( jsonSchema );
	if ( ! result.properties ) {
		return jsonSchema;
	}
	delete result.properties.$intention;
	if ( result.required ) {
		result.required = result.required.filter( ( req ) => req !== '$intention' );
	}
	return result;
}
