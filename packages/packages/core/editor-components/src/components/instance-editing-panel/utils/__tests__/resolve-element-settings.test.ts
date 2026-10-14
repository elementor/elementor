import { componentOverridablePropTypeUtil } from '../../../../prop-types/component-overridable-prop-type';
import { type ComponentOverridablePropValue } from '../../../../prop-types/component-overridable-prop-type';
import {
	applyOverridesToSettings,
	type OverridesMapping,
	unwrapOverridableSettings,
} from '../resolve-element-settings';

const STRING_VALUE = { $$type: 'string', value: 'hello' };
const NUMBER_VALUE = { $$type: 'number', value: 42 };
const OVERRIDE_VALUE = { $$type: 'string', value: 'overridden' };

function overridableSetting( overrideKey: string, originValue: ComponentOverridablePropValue[ 'origin_value' ] ) {
	return componentOverridablePropTypeUtil.create( {
		override_key: overrideKey,
		origin_value: originValue,
	} );
}

describe( 'applyOverridesToSettings', () => {
	it( 'should leave non-overridable settings unchanged', () => {
		// Arrange
		const settings = { title: STRING_VALUE, count: NUMBER_VALUE };
		const overrides: OverridesMapping = {};

		// Act
		const result = applyOverridesToSettings( settings, overrides );

		// Assert
		expect( result ).toEqual( { title: STRING_VALUE, count: NUMBER_VALUE } );
	} );

	it( 'should preserve overridable wrapper when no matching override exists', () => {
		// Arrange
		const settings = { title: overridableSetting( 'key-1', STRING_VALUE ) };
		const overrides: OverridesMapping = { 'different-key': { value: OVERRIDE_VALUE } };

		// Act
		const result = applyOverridesToSettings( settings, overrides );

		// Assert
		expect( result.title ).toEqual( overridableSetting( 'key-1', STRING_VALUE ) );
	} );

	it( 'should replace with override value when override has no outermostKey', () => {
		// Arrange
		const settings = { title: overridableSetting( 'key-1', STRING_VALUE ) };
		const overrides: OverridesMapping = { 'key-1': { value: OVERRIDE_VALUE } };

		// Act
		const result = applyOverridesToSettings( settings, overrides );

		// Assert
		expect( result.title ).toEqual( OVERRIDE_VALUE );
	} );

	it( 'should re-wrap as overridable with outermostKey when outermostKey differs from override_key', () => {
		// Arrange
		const settings = { title: overridableSetting( 'inner-key', STRING_VALUE ) };
		const overrides: OverridesMapping = {
			'inner-key': { value: OVERRIDE_VALUE, outermostKey: 'outer-key' },
		};

		// Act
		const result = applyOverridesToSettings( settings, overrides );

		// Assert
		expect( result.title ).toEqual( {
			$$type: 'overridable',
			value: {
				override_key: 'outer-key',
				origin_value: OVERRIDE_VALUE,
			},
		} );
	} );

	it( 'should handle mix of overridable and non-overridable settings', () => {
		// Arrange
		const settings = {
			title: overridableSetting( 'key-1', STRING_VALUE ),
			count: NUMBER_VALUE,
			link: overridableSetting( 'key-2', STRING_VALUE ),
		};
		const overrides: OverridesMapping = { 'key-1': { value: OVERRIDE_VALUE } };

		// Act
		const result = applyOverridesToSettings( settings, overrides );

		// Assert
		expect( result.title ).toEqual( OVERRIDE_VALUE );
		expect( result.count ).toEqual( NUMBER_VALUE );
		expect( result.link ).toEqual( overridableSetting( 'key-2', STRING_VALUE ) );
	} );

	it( 'should fall back to original propValue when override value is null', () => {
		// Arrange
		const wrappedSetting = overridableSetting( 'key-1', STRING_VALUE );
		const settings = { title: wrappedSetting };
		const overrides: OverridesMapping = { 'key-1': { value: null } };

		// Act
		const result = applyOverridesToSettings( settings, overrides );

		// Assert
		expect( result.title ).toEqual( wrappedSetting );
	} );

	it( 'should fall back to origin_value when override value is null and outermostKey is present', () => {
		// Arrange
		const settings = { title: overridableSetting( 'inner-key', STRING_VALUE ) };
		const overrides: OverridesMapping = {
			'inner-key': { value: null, outermostKey: 'outer-key' },
		};

		// Act
		const result = applyOverridesToSettings( settings, overrides );

		// Assert
		expect( result.title ).toEqual( {
			$$type: 'overridable',
			value: {
				override_key: 'outer-key',
				origin_value: STRING_VALUE,
			},
		} );
	} );
} );

describe( 'unwrapOverridableSettings', () => {
	it( 'should unwrap overridable settings to origin_value', () => {
		// Arrange
		const settings = { title: overridableSetting( 'key-1', STRING_VALUE ) };

		// Act
		const result = unwrapOverridableSettings( settings );

		// Assert
		expect( result.title ).toEqual( STRING_VALUE );
	} );

	it( 'should leave non-overridable settings unchanged', () => {
		// Arrange
		const settings = { count: NUMBER_VALUE };

		// Act
		const result = unwrapOverridableSettings( settings );

		// Assert
		expect( result.count ).toEqual( NUMBER_VALUE );
	} );

	it( 'should handle mix of overridable and non-overridable settings', () => {
		// Arrange
		const settings = {
			title: overridableSetting( 'key-1', STRING_VALUE ),
			count: NUMBER_VALUE,
		};

		// Act
		const result = unwrapOverridableSettings( settings );

		// Assert
		expect( result.title ).toEqual( STRING_VALUE );
		expect( result.count ).toEqual( NUMBER_VALUE );
	} );
} );
