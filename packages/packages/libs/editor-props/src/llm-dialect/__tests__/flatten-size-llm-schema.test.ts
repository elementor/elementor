import { initLlmDialect } from '../init';
import { flattenSizeLlmSchema } from '../flatten-size-llm-schema';
import { propTypeToLlmJsonSchema } from '../../utils/props-to-llm-schema';

const SIZE_PROP_TYPE = {
	kind: 'object',
	key: 'size',
	settings: {
		available_units: [ 'px', 'rem', 'em' ],
	},
	shape: {
		unit: {
			kind: 'string',
			key: 'string',
			settings: {
				enum: [ 'px', 'rem', 'em', '%' ],
			},
		},
		size: {
			kind: 'union',
			prop_types: {
				number: { kind: 'number', key: 'number', settings: {} },
				string: { kind: 'string', key: 'string', settings: {} },
			},
		},
	},
	meta: {},
};

const NESTED_SIZE_VALUE_SCHEMA = {
	type: 'object',
	properties: {
		unit: {
			type: 'object',
			properties: {
				$$type: { type: 'string', const: 'string' },
				value: { type: 'string', enum: [ 'px', 'rem' ] },
			},
			required: [ '$$type', 'value' ],
		},
		size: {
			anyOf: [
				{
					type: 'object',
					properties: {
						$$type: { type: 'string', const: 'number' },
						value: { type: 'number' },
					},
					required: [ '$$type', 'value' ],
				},
				{
					type: 'object',
					properties: {
						$$type: { type: 'string', const: 'string' },
						value: { type: 'string' },
					},
					required: [ '$$type', 'value' ],
				},
			],
		},
	},
	required: [ 'unit' ],
	additionalProperties: false,
};

describe( 'flattenSizeLlmSchema', () => {
	beforeAll( () => {
		initLlmDialect();
	} );

	it( 'should flatten nested size inner fields in LLM JSON schema', () => {
		// Arrange
		const nestedSchema = {
			type: 'object',
			properties: {
				$$type: { type: 'string', const: 'size' },
				value: NESTED_SIZE_VALUE_SCHEMA,
			},
			required: [ '$$type', 'value' ],
		};

		// Act
		const flatSchema = flattenSizeLlmSchema( nestedSchema, SIZE_PROP_TYPE );

		// Assert
		expect( flatSchema.properties?.value ).toEqual( {
			type: 'object',
			properties: {
				unit: { type: 'string', enum: [ 'px', 'rem', 'em' ] },
				size: {
					oneOf: [ { type: 'number' }, { type: 'string' } ],
				},
			},
			required: [ 'unit', 'size' ],
			additionalProperties: false,
		} );
	} );

	it( 'should flatten size through propTypeToLlmJsonSchema when prop type key is size', () => {
		// Arrange
		const dimensionsPropType = {
			kind: 'object',
			key: 'dimensions',
			settings: {},
			shape: {
				top: SIZE_PROP_TYPE,
			},
			meta: {},
		};

		// Act
		const schema = propTypeToLlmJsonSchema( dimensionsPropType );

		// Assert
		expect( schema.properties?.value?.properties?.top?.properties?.value ).toEqual( {
			type: 'object',
			properties: {
				unit: { type: 'string', enum: [ 'px', 'rem', 'em' ] },
				size: {
					oneOf: [ { type: 'number' }, { type: 'string' } ],
				},
			},
			required: [ 'unit', 'size' ],
			additionalProperties: false,
		} );
	} );
} );
