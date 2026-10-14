import { type PropsSchema, type PropType } from '../types';
import { type JsonSchema7 } from './prop-json-schema';

const DYNAMIC_PROP_TYPE_KEY = 'dynamic';
const OVERRIDABLE_PROP_TYPE_KEY = 'overridable';

type DynamicTagNamesResolver = ( categories: string[] ) => string[];

// Host (editor-canvas) injects a resolver that maps a prop's accepted categories to the names of the
// dynamic tags allowed for it. Keeping it injectable preserves this lib's purity: without a host the
// `name` field stays an open string instead of an enum.
let dynamicTagNamesResolver: DynamicTagNamesResolver | null = null;

export function setDynamicTagNamesResolver( resolver: DynamicTagNamesResolver | null ): void {
	dynamicTagNamesResolver = resolver;
}

// A dynamic value replaces the value of the exact node it is attached to, which may be a nested
// field (e.g. an image's `src`) rather than the property root. It is advertised once per branch, at
// the outermost prop type that supports it, and suppressed for descendants of that node to avoid
// offering the same dynamic option twice on a single branch.
export function propTypeToJsonSchema( propType: PropType, suppressDynamic: boolean = false ): JsonSchema7 {
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
			return convertUnionPropType( propType, schema, suppressDynamic );
		case 'object':
			return convertObjectPropType( propType, schema, suppressDynamic );
		case 'array':
			return convertArrayPropType( propType, schema, suppressDynamic );
		default:
			return convertPlainPropType( propType, schema );
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
		// @ts-expect-error: 'unknown' is a possible value at runtime - treat as "any"
		case 'unknown':
			return {};
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
 * Converts a union prop type to JSON Schema (anyOf).
 *
 * @param propType        The union prop type to convert
 * @param baseSchema      Base schema to extend
 * @param suppressDynamic When true, an ancestor already offered the dynamic option for this branch
 */
function convertUnionPropType(
	propType: PropType & { kind: 'union' },
	baseSchema: JsonSchema7,
	suppressDynamic: boolean
): JsonSchema7 {
	const schema = structuredClone( baseSchema );

	const propTypes = propType.prop_types || {};
	const offersDynamic = ! suppressDynamic && Boolean( propTypes[ DYNAMIC_PROP_TYPE_KEY ] );
	const suppressNestedDynamic = suppressDynamic || offersDynamic;
	const schemas: JsonSchema7[] = [];

	// Convert each prop type in the union
	for ( const [ typeKey, subPropType ] of Object.entries( propTypes ) ) {
		if ( typeKey === OVERRIDABLE_PROP_TYPE_KEY ) {
			continue;
		}
		if ( typeKey === DYNAMIC_PROP_TYPE_KEY ) {
			if ( offersDynamic ) {
				schemas.push( convertDynamicPropType( subPropType ) );
			}
			continue;
		}
		schemas.push( propTypeToJsonSchema( subPropType, suppressNestedDynamic ) );
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

// Emits a compact representation of the `dynamic` union member. It is offered as one option of THIS
// node's value (e.g. a property root, or a nested field such as an image's `src`): put the dynamic
// object exactly here, in place of the sibling static variant. Only `name` is required from the LLM
// (constrained to the tags allowed here); `group` is filled by the host resolver, and `settings` are
// described per-tag in the dynamic-tags resource, so the full tag catalog is never inlined.
function convertDynamicPropType( propType: PropType ): JsonSchema7 {
	const categories = Array.isArray( propType.settings?.categories )
		? ( propType.settings.categories as string[] )
		: [];
	const allowedTagNames = dynamicTagNamesResolver?.( categories ) ?? [];

	return {
		type: 'object',
		description:
			'Bind THIS value to a dynamic tag instead of a static value (this may be a nested field, ' +
			'e.g. an image\'s "src"). Look up the chosen tag in the "elementor://dynamic-tags" resource ' +
			'and populate "settings" exactly as its schema requires.',
		properties: {
			$$type: { type: 'string', const: DYNAMIC_PROP_TYPE_KEY },
			value: {
				type: 'object',
				properties: {
					name: {
						type: 'string',
						description: 'Dynamic tag name from "elementor://dynamic-tags".',
						...( allowedTagNames.length ? { enum: allowedTagNames } : {} ),
					},
					settings: {
						type: 'object',
						description: "Tag settings matching the chosen tag's schema in the resource.",
					},
				},
				required: [ 'name' ],
			},
		},
		required: [ '$$type', 'value' ],
	};
}

function convertObjectPropType(
	propType: PropType & { kind: 'object' },
	baseSchema: JsonSchema7,
	suppressDynamic: boolean
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

	// Convert each property in the object shape
	for ( const [ key, subPropType ] of Object.entries( shape ) ) {
		const propSchema = propTypeToJsonSchema( subPropType, suppressDynamic );

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

function convertArrayPropType(
	propType: PropType & { kind: 'array' },
	baseSchema: JsonSchema7,
	suppressDynamic: boolean
): JsonSchema7 {
	const schema = structuredClone( baseSchema );

	schema.type = 'object';
	let items: unknown;

	const itemPropType = propType.item_prop_type;

	if ( itemPropType ) {
		items = propTypeToJsonSchema( itemPropType, suppressDynamic );
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
