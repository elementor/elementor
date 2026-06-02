import {
	type DialectPropAdapter,
	LLMDialectAdapter,
	type SchemaGenerationContext,
} from '../llm-dialect/llm-prop-schema';
import { isLlmDialectSkip } from '../llm-dialect/skip';
import { type PropsSchema, type PropType } from '../types';
import { type JsonSchema7 } from './prop-json-schema';

export function propTypeToLlmJsonSchema( propType: PropType ): JsonSchema7 {
	return LLMDialectAdapter.finalizeLlmSchema( propTypeToJsonSchema( propType, LLMDialectAdapter ) );
}

export function propTypeToJsonSchema(
	propType: PropType,
	dialect?: DialectPropAdapter,
	schemaContext: SchemaGenerationContext = {}
): JsonSchema7 {
	const description = propType.meta?.description;

	const schema: JsonSchema7 = {};

	if ( description ) {
		schema.description = description;
	}

	if ( propType.initial_value !== null && propType.initial_value !== undefined ) {
		schema.examples = [ propType.initial_value ];
	}

	switch ( propType.kind ) {
		case 'union':
			return convertUnionPropType( propType, schema, dialect, schemaContext );
		case 'object':
			return convertObjectPropType( propType, schema, dialect, schemaContext );
		case 'array':
			return convertArrayPropType( propType, schema, dialect, schemaContext );
		default: {
			const result = convertPlainPropType( propType, schema );
			if ( ! dialect ) {
				return result;
			}

			const dialectSchema = dialect.toDialectSchema( result, propType, schemaContext );
			return isLlmDialectSkip( dialectSchema ) ? result : dialectSchema;
		}
	}
}

function convertPlainPropType(
	propType: PropType & { key: string; kind: string },
	baseSchema: JsonSchema7
): JsonSchema7 {
	const schema = { ...baseSchema };

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

function convertUnionPropType(
	propType: PropType & { kind: 'union' },
	baseSchema: JsonSchema7,
	dialect?: DialectPropAdapter,
	schemaContext: SchemaGenerationContext = {}
): JsonSchema7 {
	const schema = structuredClone( baseSchema );

	const propTypes = propType.prop_types || {};
	const schemas: JsonSchema7[] = [];

	for ( const [ typeKey, subPropType ] of Object.entries( propTypes ) ) {
		if ( typeKey === 'overridable' || ( typeKey === 'dynamic' && dialect ) ) {
			continue;
		}
		schemas.push( convertPropTypeToJsonSchema( subPropType, dialect, schemaContext ) );
	}

	if ( schemas.length > 0 ) {
		schema.anyOf = schemas;
	}

	const propTypeDescription = propType.meta?.description;
	if ( propTypeDescription ) {
		schema.description = propTypeDescription;
	}
	if ( ! dialect ) {
		return schema;
	}

	const dialectSchema = dialect.toDialectSchema( schema, propType, schemaContext );
	return isLlmDialectSkip( dialectSchema ) ? schema : dialectSchema;
}

function convertObjectPropType(
	propType: PropType & { kind: 'object' },
	baseSchema: JsonSchema7,
	dialect?: DialectPropAdapter,
	schemaContext: SchemaGenerationContext = {}
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

	for ( const [ key, subPropType ] of Object.entries( shape ) ) {
		const propSchema = propTypeToJsonSchema( subPropType, dialect, {
			parentPropType: propType,
			shapeKey: key,
		} );

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

	if ( ! dialect ) {
		return mergedSchema;
	}

	const dialectSchema = dialect.toDialectSchema( mergedSchema, propType, schemaContext );
	return isLlmDialectSkip( dialectSchema ) ? mergedSchema : dialectSchema;
}

function convertArrayPropType(
	propType: PropType & { kind: 'array' },
	baseSchema: JsonSchema7,
	dialect?: DialectPropAdapter,
	schemaContext: SchemaGenerationContext = {}
): JsonSchema7 {
	const schema = structuredClone( baseSchema );

	schema.type = 'object';
	let items: unknown;

	const itemPropType = propType.item_prop_type;

	if ( itemPropType ) {
		items = convertPropTypeToJsonSchema( itemPropType, dialect, schemaContext );
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
	if ( ! dialect ) {
		return schema;
	}

	const dialectSchema = dialect.toDialectSchema( schema, propType, schemaContext );
	return isLlmDialectSkip( dialectSchema ) ? schema : dialectSchema;
}

function convertPropTypeToJsonSchema(
	propType: PropType,
	dialect?: DialectPropAdapter,
	schemaContext: SchemaGenerationContext = {}
): JsonSchema7 {
	return propTypeToJsonSchema( propType, dialect, schemaContext );
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
