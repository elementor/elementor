import { type PropsSchema, type PropType } from '../types';
import { type JsonSchema7 } from './prop-json-schema';

export function propTypeToJsonSchema( propType: PropType ): JsonSchema7 {
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
			return convertUnionPropType( propType, schema );
		case 'object':
			return convertObjectPropType( propType, schema );
		case 'array':
			return convertArrayPropType( propType, schema );
		default:
			return convertPlainPropType( propType, schema );
	}
}

function convertPlainPropType(
	propType: PropType & { key: string; kind: string },
	baseSchema: JsonSchema7
): JsonSchema7 {
	const schema = { ...baseSchema };

<<<<<<< HEAD
	// This could happen when data is malformed due to a bug, added this as a safeguard.
	if ( ! Object.hasOwn( propType, 'kind' ) ) {
		throw new Error( `PropType kind is undefined for propType with key: ${ propType.key ?? '[unknown key]' }` );
=======
	if ( ! propType.kind ) {
		throw new Error( `PropType kind is undefined for propType with key: ${ propType.key }` );
>>>>>>> d3f0ba9dd7 (deep schema work)
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
 */
function convertUnionPropType( propType: PropType & { kind: 'union' }, baseSchema: JsonSchema7 ): JsonSchema7 {
	const schema = structuredClone( baseSchema );

	const propTypes = propType.prop_types || {};
	const schemas: JsonSchema7[] = [];

	// Convert each prop type in the union
	for ( const [ typeKey, subPropType ] of Object.entries( propTypes ) ) {
		if ( typeKey === 'dynamic' || typeKey === 'overridable' ) {
			continue;
		}
		const subSchema = convertPropTypeToJsonSchema( subPropType );
		schemas.push( subSchema );
	}

	if ( schemas.length > 0 ) {
		schema.anyOf = schemas;
	}

	const propTypeDescription = propType.meta?.description;
	if ( propTypeDescription ) {
		schema.description = propTypeDescription;
	}
	return schema;
}

function convertObjectPropType( propType: PropType & { kind: 'object' }, baseSchema: JsonSchema7 ): JsonSchema7 {
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

	// Convert each property in the object shape
	for ( const [ key, subPropType ] of Object.entries( shape ) ) {
		const propSchema = propTypeToJsonSchema( subPropType );

		// Check if this property is required
		if ( subPropType.settings?.required === true ) {
			valueRequired.push( key );
		}

		if ( internalStructure.properties.value.properties ) {
			internalStructure.properties.value.properties[ key ] = propSchema;
		}
	}

	schema.required = required;
	if ( valueRequired.length > 0 ) {
		internalStructure.properties.value.required = valueRequired;
	}

	return {
		...schema,
		...internalStructure,
	};
}

function convertArrayPropType( propType: PropType & { kind: 'array' }, baseSchema: JsonSchema7 ): JsonSchema7 {
	const schema = structuredClone( baseSchema );

	schema.type = 'object';
	let items: unknown;

	const itemPropType = propType.item_prop_type;

	if ( itemPropType ) {
		items = convertPropTypeToJsonSchema( itemPropType );
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
	return schema;
}

function convertPropTypeToJsonSchema( propType: PropType ): JsonSchema7 {
	return propTypeToJsonSchema( propType );
}

export function propsSchemaToJsonSchema( schema: PropsSchema ): JsonSchema7 {
	const jsonSchema: JsonSchema7 = {
		type: 'object',
		properties: {},
	};

	for ( const [ key, propType ] of Object.entries( schema ) ) {
		// Skip internal properties
		if ( ! isPropKeyConfigurable( key ) ) {
			continue;
		}

		const propSchema = convertPropTypeToJsonSchema( propType );
		if ( jsonSchema.properties ) {
			jsonSchema.properties[ key ] = propSchema;
		}

		// Handle required fields at root level if needed
		// (typically props are optional unless specified)
	}

	return jsonSchema;
}

export const nonConfigurablePropKeys = [ '_cssid', 'classes', 'attributes' ] as readonly string[];

export function isPropKeyConfigurable( propKey: string ): boolean {
	return ! nonConfigurablePropKeys.includes( propKey );
}

export function configurableKeys( schema: PropsSchema ): string[] {
	return Object.keys( schema ).filter( isPropKeyConfigurable );
}
