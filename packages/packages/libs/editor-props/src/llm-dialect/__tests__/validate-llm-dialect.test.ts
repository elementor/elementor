import { type PropType } from '../../types';
import { initLlmDialect } from '../init';
import { validateLlmJson } from '../validate-llm-dialect';

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
} as PropType;

const STRING_PROP_TYPE = {
	kind: 'string',
	key: 'string',
	settings: {
		enum: [ 'flex', 'block' ],
	},
	meta: {},
} as PropType;

describe( 'validateLlmJson', () => {
	beforeAll( () => {
		initLlmDialect();
	} );

	it( 'accepts flat LLM size values', () => {
		// Arrange
		const value = {
			$$type: 'size',
			value: {
				unit: 'px',
				size: 16,
			},
		};

		// Act
		const result = validateLlmJson( SIZE_PROP_TYPE, value );

		// Assert
		expect( result.valid ).toBe( true );
	} );

	it( 'rejects size values with invalid unit', () => {
		// Arrange
		const value = {
			$$type: 'size',
			value: {
				unit: 'invalid-unit',
				size: 16,
			},
		};

		// Act
		const result = validateLlmJson( SIZE_PROP_TYPE, value );

		// Assert
		expect( result.valid ).toBe( false );
		expect( result.errors?.length ).toBeGreaterThan( 0 );
	} );

	it( 'accepts canonical string prop values', () => {
		// Arrange
		const value = {
			$$type: 'string',
			value: 'flex',
		};

		// Act
		const result = validateLlmJson( STRING_PROP_TYPE, value );

		// Assert
		expect( result.valid ).toBe( true );
	} );

	it( 'accepts null values', () => {
		// Act
		const result = validateLlmJson( STRING_PROP_TYPE, null );

		// Assert
		expect( result.valid ).toBe( true );
	} );
} );
