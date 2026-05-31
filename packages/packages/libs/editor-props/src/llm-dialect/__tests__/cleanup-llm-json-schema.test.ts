import { type UnionPropType } from '../../types';
import { propTypeToLlmJsonSchema } from '../../utils/props-to-llm-schema';
import { cleanupLlmJsonSchema } from '../cleanup-llm-json-schema';
import { initLlmDialect } from '../init';

const dynamicPropType = {
	kind: 'plain',
	key: 'dynamic',
	settings: {
		categories: [ 'text' ],
	},
};

describe( 'cleanupLlmJsonSchema', () => {
	beforeAll( () => {
		initLlmDialect();
	} );

	it( 'should remove anyOf when a union prop type resolves to a single branch', () => {
		// Arrange
		const titlePropType = {
			kind: 'union',
			meta: {
				description: 'Heading title',
			},
			prop_types: {
				string: {
					kind: 'string',
					key: 'string',
					settings: {},
				},
				dynamic: dynamicPropType,
			},
		} as unknown as UnionPropType;

		// Act
		const schema = propTypeToLlmJsonSchema( titlePropType );

		// Assert
		expect( schema.anyOf ).toBeUndefined();
		expect( schema.description ).toBe( 'Heading title' );
		expect( schema.properties?.$$type?.const ).toBe( 'string' );
		expect( schema.properties?.bindTo ).toBeDefined();
	} );

	it( 'should remove oneOf when it contains only one option', () => {
		// Arrange
		const schema = {
			description: 'Wrapper description',
			oneOf: [
				{
					type: 'string',
					description: 'Branch description',
				},
			],
		};

		// Act
		const cleaned = cleanupLlmJsonSchema( schema );

		// Assert
		expect( cleaned.oneOf ).toBeUndefined();
		expect( cleaned ).toEqual( {
			type: 'string',
			description: 'Wrapper description Branch description',
		} );
	} );

	it( 'should keep the branch intact and only merge description from the parent wrapper', () => {
		// Arrange
		const schema = {
			description: 'Parent description',
			allowBind: true,
			oneOf: [
				{
					type: 'string',
					allowBind: true,
				},
			],
		};

		// Act
		const cleaned = cleanupLlmJsonSchema( schema );

		// Assert
		expect( cleaned ).toEqual( {
			type: 'string',
			description: 'Parent description',
			allowBind: true,
		} );
	} );

	it( 'should use the branch description when the parent wrapper has none', () => {
		// Arrange
		const schema = {
			oneOf: [
				{
					type: 'string',
					description: 'Branch description',
				},
			],
		};

		// Act
		const cleaned = cleanupLlmJsonSchema( schema );

		// Assert
		expect( cleaned ).toEqual( {
			type: 'string',
			description: 'Branch description',
		} );
	} );

	it( 'should keep oneOf when it contains multiple options', () => {
		// Arrange
		const schema = {
			oneOf: [ { type: 'number' }, { type: 'string' } ],
		};

		// Act
		const cleaned = cleanupLlmJsonSchema( schema );

		// Assert
		expect( cleaned.oneOf ).toHaveLength( 2 );
	} );
} );
