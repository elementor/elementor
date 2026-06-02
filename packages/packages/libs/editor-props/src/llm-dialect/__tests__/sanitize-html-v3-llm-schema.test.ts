import { type ObjectPropType, type UnionPropType } from '../../types';
import { propTypeToLlmJsonSchema } from '../../utils/props-to-llm-schema';
import { initLlmDialect } from '../init';

const stringPropType = {
	kind: 'string',
	key: 'string',
	default: null,
	meta: {},
	settings: {},
	dependencies: null,
	initial_value: null,
};

const dynamicPropType = {
	kind: 'plain',
	key: 'dynamic',
	default: null,
	meta: {},
	settings: {
		categories: [ 'text' ],
	},
};

const htmlV3PropType = {
	kind: 'object',
	key: 'html-v3',
	default: null,
	meta: {},
	settings: {},
	dependencies: null,
	initial_value: null,
	shape: {
		content: {
			kind: 'union',
			default: null,
			meta: {},
			settings: {},
			prop_types: {
				string: stringPropType,
				dynamic: dynamicPropType,
			},
		},
		children: {
			kind: 'array',
			key: 'array',
			default: null,
			meta: {},
			settings: {},
			item_prop_type: {
				kind: 'plain',
				key: 'unknown',
				default: null,
				meta: {},
				settings: {},
			},
		},
	},
} as unknown as ObjectPropType;

const titlePropType = {
	kind: 'union',
	default: null,
	meta: {
		description: 'Heading title',
	},
	settings: {},
	prop_types: {
		'html-v3': htmlV3PropType,
		dynamic: dynamicPropType,
	},
} as unknown as UnionPropType;

describe( 'html-v3 LLM schema dialect', () => {
	beforeAll( () => {
		initLlmDialect();
	} );

	it.skip( 'should expose bindTo only on the root union branches', () => {
		// Arrange
		const expectedCategories = 'text';

		// Act
		const schema = propTypeToLlmJsonSchema( titlePropType );
		const contentSchema = schema.properties?.value?.properties?.content;

		// Assert
		expect( schema.allowBind ).toBe( true );
		expect( schema.properties?.$$type?.const ).toBe( 'html-v3' );
		expect( schema.properties?.bindTo ).toBeDefined();
		expect( schema.properties?.bindTo?.description ).toContain( expectedCategories );
		expect( contentSchema?.properties?.bindTo ).toBeUndefined();
		expect( contentSchema?.allowBind ).toBeUndefined();
	} );

	it( 'should strip dynamic from html-v3 nested content union', () => {
		// Arrange
		const schema = propTypeToLlmJsonSchema( titlePropType );
		const contentSchema = schema.properties?.value?.properties?.content;

		// Assert
		expect( contentSchema?.anyOf ).toBeUndefined();
		expect( contentSchema?.properties?.$$type?.const ).toBe( 'string' );
	} );

	it.skip( 'should not add bindTo on nested unions inside object shapes', () => {
		// Arrange
		const schema = propTypeToLlmJsonSchema( htmlV3PropType );

		// Act
		const contentSchema = schema.properties?.value?.properties?.content;

		// Assert
		expect( schema.properties?.bindTo ).toBeUndefined();
		expect( contentSchema?.properties?.bindTo ).toBeUndefined();
		expect( contentSchema?.allowBind ).toBeUndefined();
	} );
} );
