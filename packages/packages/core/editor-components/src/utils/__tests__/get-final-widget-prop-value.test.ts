import { componentInstanceOverridePropTypeUtil } from '../../prop-types/component-instance-override-prop-type';
import { componentOverridablePropTypeUtil } from '../../prop-types/component-overridable-prop-type';
import { getFinalWidgetPropValue } from '../get-final-widget-prop-value';

describe( 'getFinalWidgetPropValue', () => {
	const PLAIN_STRING_VALUE = { $$type: 'string', value: 'Plain Text' };
	const OVERRIDE_STRING_VALUE = { $$type: 'string', value: 'Override Text' };
	const NESTED_STRING_VALUE = { $$type: 'string', value: 'Nested Override Text' };

	it.each( [
		{
			should: 'return plain prop value as-is',
			input: PLAIN_STRING_VALUE,
			expected: PLAIN_STRING_VALUE,
		},
		{
			should: 'extract origin_value from overridable prop',
			input: componentOverridablePropTypeUtil.create( {
				override_key: 'prop-1',
				origin_value: OVERRIDE_STRING_VALUE,
			} ),
			expected: OVERRIDE_STRING_VALUE,
		},
		{
			should: 'extract override_value from override prop',
			input: componentInstanceOverridePropTypeUtil.create( {
				override_key: 'prop-1',
				override_value: OVERRIDE_STRING_VALUE,
				schema_source: { type: 'component', id: 123 },
			} ),
			expected: OVERRIDE_STRING_VALUE,
		},
		{
			should: 'extract innermost override_value from overridable containing override',
			input: componentOverridablePropTypeUtil.create( {
				override_key: 'outer-key',
				origin_value: componentInstanceOverridePropTypeUtil.create( {
					override_key: 'inner-key',
					override_value: NESTED_STRING_VALUE,
					schema_source: { type: 'component', id: 456 },
				} ),
			} ),
			expected: NESTED_STRING_VALUE,
		},
	] )( 'should $should', ( { input, expected } ) => {
		// Act
		const result = getFinalWidgetPropValue( input );

		// Assert
		expect( result ).toEqual( expected );
	} );
} );
