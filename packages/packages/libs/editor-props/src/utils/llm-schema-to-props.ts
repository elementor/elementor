import { type PropsSchema, type PropType } from '../types';
import { type JsonSchema7 } from './prop-json-schema';

export function jsonSchemaToPropType( schema: JsonSchema7, key = < string >schema.key ): PropType {
	const meta: Record< string, unknown > = {};

	if ( schema.description ) {
		meta.description = schema.description;
	}

	// Handle union types (anyOf)
	if ( schema.anyOf && Array.isArray( schema.anyOf ) ) {
		return convertJsonSchemaToUnionPropType( schema, meta );
	}

	// Handle object types
	if ( schema.type === 'object' && schema.properties ) {
		return convertJsonSchemaToObjectPropType( schema, meta, key );
	}

	// Handle array types
	if ( schema.type === 'array' && schema.items ) {
		return convertJsonSchemaToArrayPropType( schema, meta, key );
	}

	// Handle plain types (string, number, boolean)
	return convertJsonSchemaToPlainPropType( schema, meta, key );
}

function convertJsonSchemaToPlainPropType(
	schema: JsonSchema7,
	meta: Record< string, unknown >,
	key = < string >schema.key
): PropType {
	const settings: Record< string, unknown > = {};

	// Determine the key based on type
	let propKey = key || 'string';

	if ( schema.type === 'number' ) {
		propKey = 'number';
	} else if ( schema.type === 'boolean' ) {
		propKey = 'boolean';
	} else if ( schema.type === 'string' ) {
		propKey = 'string';
	}

	// Handle enum values
	if ( Array.isArray( schema.enum ) ) {
		settings.enum = schema.enum;
	}

	return {
		kind: 'plain',
		key: propKey,
		settings,
		meta,
	} as PropType;
}

/**
 * Converts a JSON Schema anyOf to a union PropType
 * @param schema
 * @param meta
 */
function convertJsonSchemaToUnionPropType( schema: JsonSchema7, meta: Record< string, unknown > ): PropType {
	const propTypes: Record< string, PropType > = {};

	if ( ! schema.anyOf || ! Array.isArray( schema.anyOf ) ) {
		throw new Error( 'Invalid anyOf schema' );
	}

	// Process each variant in the anyOf array
	for ( const variantSchema of schema.anyOf ) {
		// Each variant should be an object with $$type and value properties
		if (
			variantSchema.type === 'object' &&
			variantSchema.properties &&
			variantSchema.properties.$$type &&
			variantSchema.properties.value
		) {
			const typeProperty = variantSchema.properties.$$type;

			// Extract the type key from the enum
			let typeKey: string;
			if ( typeProperty.enum && Array.isArray( typeProperty.enum ) && typeProperty.enum.length > 0 ) {
				typeKey = typeProperty.enum[ 0 ] as string;
			} else {
				continue;
			}

			// Convert the value schema to a PropType
			const valuePropType = convertJsonSchemaToPropType( variantSchema.properties.value );
			propTypes[ typeKey ] = valuePropType;
		}
	}

	return {
		kind: 'union',
		prop_types: propTypes,
		settings: {},
		meta,
	} as PropType;
}

function convertJsonSchemaToObjectPropType(
	schema: JsonSchema7,
	meta: Record< string, unknown >,
	key = < string >schema.key
): PropType {
	const shape: Record< string, PropType > = {};

	if ( ! schema.properties ) {
		return {
			kind: 'object',
			key,
			shape: {},
			settings: {},
			meta,
		} as PropType;
	}

	const requiredFields = Array.isArray( schema.required ) ? schema.required : [];

	// Convert each property
	for ( const [ propKey, propSchema ] of Object.entries( schema.properties ) ) {
		const subPropType = convertJsonSchemaToPropType( propSchema, key );

		// Mark as required if it's in the required array
		if ( requiredFields.includes( propKey ) ) {
			subPropType.settings = {
				...subPropType.settings,
				required: true,
			};
		}

		shape[ propKey ] = subPropType;
	}

	return {
		kind: 'object',
		key: key || 'object',
		shape,
		settings: {},
		meta,
	} as PropType;
}

function convertJsonSchemaToArrayPropType(
	schema: JsonSchema7,
	meta: Record< string, unknown >,
	key = < string >schema.key
): PropType {
	if ( ! schema.items ) {
		throw new Error( 'Array schema must have items property' );
	}

	const itemPropType = convertJsonSchemaToPropType( schema.items );

	return {
		kind: 'array',
		key: key || 'array',
		item_prop_type: itemPropType,
		settings: {},
		meta,
	} as PropType;
}

function convertJsonSchemaToPropType( schema: JsonSchema7, key?: string ): PropType {
	return jsonSchemaToPropType( schema, key );
}

/**
 * Converts a complete JSON Schema object back to a PropsSchema
 *
 * @param jsonSchema The JSON Schema to convert
 */
export function jsonSchemaToPropsSchema( jsonSchema: JsonSchema7 ): PropsSchema {
	const propsSchema: PropsSchema = {};

	if ( jsonSchema.type !== 'object' || ! jsonSchema.properties ) {
		throw new Error( 'Root schema must be an object with properties' );
	}

	for ( const [ key, propSchema ] of Object.entries( jsonSchema.properties ) ) {
		propsSchema[ key ] = convertJsonSchemaToPropType( propSchema, key );
	}

	return propsSchema;
}
