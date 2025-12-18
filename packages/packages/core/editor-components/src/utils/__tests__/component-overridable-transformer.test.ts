import { type AnyTransformer, settingsTransformersRegistry } from '@elementor/editor-canvas';
import { type TransformablePropValue } from '@elementor/editor-props';

import { componentInstanceContext } from '../../component-instance-transformer';
import { componentOverridableTransformer } from '../../component-overridable-transformer';
import { componentOverrideTransformer } from '../../component-override-transformer';
import { type ComponentOverridable } from '../../types';

describe( 'componentOverridableTransformer', () => {
	const TEST_OPTIONS = { key: 'test-key' };
	const TEST_OVERRIDE_KEY = 'test-override-key';
	const TEST_ORIGIN_VALUE: TransformablePropValue< string > = {
		$$type: 'string',
		value: 'origin-value',
	};
	const TEST_OVERRIDE_VALUE = {
		$$type: 'string',
		value: 'Override String',
	};

	settingsTransformersRegistry.register( 'override', componentOverrideTransformer );

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

		const value: ComponentOverridable = {
			override_key: TEST_OVERRIDE_KEY,
			origin_value: {
				$$type: 'override',
				value: {
					override_key: TRANSFORMED_KEY,
					override_value: {
						$$type: 'string',
						value: 'inner-value',
					},
				},
			},
		};

		componentInstanceContext.set( {
			overrides: { [ TEST_OVERRIDE_KEY ]: TEST_OVERRIDE_VALUE },
		} );

		// Act
		const result = componentOverridableTransformer( value, TEST_OPTIONS );

		// Assert
		expect( result ).toEqual( {
			[ TRANSFORMED_KEY ]: TEST_OVERRIDE_VALUE,
		} );
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
