import { type AnyTransformer, settingsTransformersRegistry } from '@elementor/editor-canvas';
import { type TransformablePropValue } from '@elementor/editor-props';

import { componentInstanceContext } from '../../component-instance-transformer';
import { componentOverridableTransformer } from '../../component-overridable-transformer';
import { type ComponentOverridable } from '../../types';

jest.mock( '@elementor/editor-canvas', () => ( {
	...jest.requireActual( '@elementor/editor-canvas' ),
	settingsTransformersRegistry: {
		get: jest.fn(),
	},
} ) );

const mockSettingsTransformersRegistry = settingsTransformersRegistry as jest.Mocked<
	typeof settingsTransformersRegistry
>;

describe( 'componentOverridableTransformer', () => {
	const TEST_OPTIONS = { key: 'test-key' };
	const TEST_OVERRIDE_KEY = 'test-override-key';
	const TEST_ORIGIN_VALUE: TransformablePropValue< string > = {
		$$type: 'string',
		value: 'origin-value',
	};
	const TEST_OVERRIDE_VALUE = 'override-value';

	beforeEach( () => {
		jest.clearAllMocks();
		componentInstanceContext.set( { overrides: {} } );
	} );

	it( 'should return origin value when no overrides exist in context', () => {
		// Arrange
		const value: ComponentOverridable = {
			override_key: TEST_OVERRIDE_KEY,
			origin_value: TEST_ORIGIN_VALUE,
		};
		componentInstanceContext.set( { overrides: {} } );

		// Act
		const result = componentOverridableTransformer( value, TEST_OPTIONS );

		// Assert
		expect( result ).toBe( TEST_ORIGIN_VALUE );
	} );

	it( 'should return origin value when override key does not match', () => {
		// Arrange
		const value: ComponentOverridable = {
			override_key: TEST_OVERRIDE_KEY,
			origin_value: TEST_ORIGIN_VALUE,
		};
		componentInstanceContext.set( {
			overrides: { 'different-key': TEST_OVERRIDE_VALUE },
		} );

		// Act
		const result = componentOverridableTransformer( value, TEST_OPTIONS );

		// Assert
		expect( result ).toBe( TEST_ORIGIN_VALUE );
	} );

	it( 'should return override value when override exists and origin is not an override type', () => {
		// Arrange
		const value: ComponentOverridable = {
			override_key: TEST_OVERRIDE_KEY,
			origin_value: TEST_ORIGIN_VALUE,
		};
		componentInstanceContext.set( {
			overrides: { [ TEST_OVERRIDE_KEY ]: TEST_OVERRIDE_VALUE },
		} );

		// Act
		const result = componentOverridableTransformer( value, TEST_OPTIONS );

		// Assert
		expect( result ).toEqual( TEST_OVERRIDE_VALUE );
	} );

	it( 'should transform override when origin value is an override type', () => {
		// Arrange
		const TRANSFORMED_KEY = 'transformed-key';
		const INNER_VALUE = 'inner-value';

		const value: ComponentOverridable = {
			override_key: TEST_OVERRIDE_KEY,
			origin_value: {
				$$type: 'override',
				value: INNER_VALUE,
			},
		};

		const mockTransformer = jest.fn().mockReturnValue( {
			[ TRANSFORMED_KEY ]: 'original-transformed-value',
		} ) as unknown as AnyTransformer;

		mockSettingsTransformersRegistry.get.mockReturnValue( mockTransformer );

		componentInstanceContext.set( {
			overrides: { [ TEST_OVERRIDE_KEY ]: TEST_OVERRIDE_VALUE },
		} );

		// Act
		const result = componentOverridableTransformer( value, TEST_OPTIONS );

		// Assert
		expect( mockSettingsTransformersRegistry.get ).toHaveBeenCalledWith( 'override' );
		expect( mockTransformer ).toHaveBeenCalledWith( INNER_VALUE, TEST_OPTIONS );
		expect( result ).toEqual( {
			[ TRANSFORMED_KEY ]: TEST_OVERRIDE_VALUE,
		} );
	} );

	it( 'should return null when transformer is not found in registry', () => {
		// Arrange
		const value: ComponentOverridable = {
			override_key: TEST_OVERRIDE_KEY,
			origin_value: {
				$$type: 'override',
				value: 'some-value',
			},
		};

		mockSettingsTransformersRegistry.get.mockReturnValue( null );

		componentInstanceContext.set( {
			overrides: { [ TEST_OVERRIDE_KEY ]: TEST_OVERRIDE_VALUE },
		} );

		// Act
		const result = componentOverridableTransformer( value, TEST_OPTIONS );

		// Assert
		expect( result ).toBeNull();
	} );

	it( 'should return null when transformer returns null', () => {
		// Arrange
		const value: ComponentOverridable = {
			override_key: TEST_OVERRIDE_KEY,
			origin_value: {
				$$type: 'override',
				value: 'some-value',
			},
		};

		const mockTransformer = jest.fn().mockReturnValue( null ) as unknown as AnyTransformer;
		mockSettingsTransformersRegistry.get.mockReturnValue( mockTransformer );

		componentInstanceContext.set( {
			overrides: { [ TEST_OVERRIDE_KEY ]: TEST_OVERRIDE_VALUE },
		} );

		// Act
		const result = componentOverridableTransformer( value, TEST_OPTIONS );

		// Assert
		expect( result ).toBeNull();
	} );

	it( 'should handle multiple overrides in context and select correct one', () => {
		// Arrange
		const FIRST_OVERRIDE_KEY = 'first-key';
		const SECOND_OVERRIDE_KEY = 'second-key';
		const FIRST_VALUE = 'first-override-value';
		const SECOND_VALUE = 'second-override-value';

		const originValue: TransformablePropValue< string > = {
			$$type: 'string',
			value: 'origin',
		};

		const value: ComponentOverridable = {
			override_key: SECOND_OVERRIDE_KEY,
			origin_value: originValue,
		};

		componentInstanceContext.set( {
			overrides: {
				[ FIRST_OVERRIDE_KEY ]: FIRST_VALUE,
				[ SECOND_OVERRIDE_KEY ]: SECOND_VALUE,
			},
		} );

		// Act
		const result = componentOverridableTransformer( value, TEST_OPTIONS );

		// Assert
		expect( result ).toEqual( SECOND_VALUE );
	} );
} );
