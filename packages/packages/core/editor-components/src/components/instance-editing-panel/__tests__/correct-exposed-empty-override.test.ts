import { componentInstanceOverridePropTypeUtil } from '../../../prop-types/component-instance-override-prop-type';
import { componentOverridablePropTypeUtil } from '../../../prop-types/component-overridable-prop-type';
import { correctExposedEmptyOverride } from '../utils/correct-exposed-empty-override';

const MOCK_COMPONENT_ID = 456;
const ORIGIN_OVERRIDE_KEY = 'prop-1';
const OUTER_KEY = 'outer-key';
const RESOLVED_VALUE = { $$type: 'string', value: 'Resolved Text' };

describe( 'correctExposedEmptyOverride', () => {
	it( 'should reset origin_value to null when exposing an override that was never set', () => {
		// Arrange
		const newPropValue = componentOverridablePropTypeUtil.create( {
			override_key: OUTER_KEY,
			origin_value: RESOLVED_VALUE,
		} );
		const matchingOverride = null;

		// Act
		const result = correctExposedEmptyOverride( newPropValue, matchingOverride );

		// Assert
		const resultValue = componentOverridablePropTypeUtil.extract( result );
		expect( resultValue ).toEqual( {
			override_key: OUTER_KEY,
			origin_value: null,
		} );
	} );

	it( 'should return value as is when setting new value for an override that already exists', () => {
		// Arrange
		const matchingOverride = componentInstanceOverridePropTypeUtil.create( {
			override_key: ORIGIN_OVERRIDE_KEY,
			override_value: { $$type: 'string', value: 'Previous override value' },
			schema_source: { type: 'component', id: MOCK_COMPONENT_ID },
		} );

		const newPropValue = componentOverridablePropTypeUtil.create( {
			override_key: OUTER_KEY,
			origin_value: componentInstanceOverridePropTypeUtil.create( {
				override_key: ORIGIN_OVERRIDE_KEY,
				override_value: { $$type: 'string', value: 'New override value' },
				schema_source: { type: 'component', id: MOCK_COMPONENT_ID },
			} ),
		} );

		// Act
		const result = correctExposedEmptyOverride( newPropValue, matchingOverride );

		// Assert
		expect( result ).toBe( newPropValue );
	} );

	it( 'should return value as is when setting new value for an override that already exists and exposed as overridable', () => {
		// Arrange
		const matchingOverride = componentOverridablePropTypeUtil.create( {
			override_key: OUTER_KEY,
			origin_value: componentInstanceOverridePropTypeUtil.create( {
				override_key: ORIGIN_OVERRIDE_KEY,
				override_value: { $$type: 'string', value: 'Previous override value' },
				schema_source: { type: 'component', id: MOCK_COMPONENT_ID },
			} ),
		} );

		const newPropValue = componentOverridablePropTypeUtil.create( {
			override_key: OUTER_KEY,
			origin_value: componentInstanceOverridePropTypeUtil.create( {
				override_key: ORIGIN_OVERRIDE_KEY,
				override_value: { $$type: 'string', value: 'New override value' },
				schema_source: { type: 'component', id: MOCK_COMPONENT_ID },
			} ),
		} );

		// Act
		const result = correctExposedEmptyOverride( newPropValue, matchingOverride );

		// Assert
		expect( result ).toBe( newPropValue );
	} );

	it( 'should return value as is when it is not an overridable type', () => {
		// Arrange
		const newPropValue = componentInstanceOverridePropTypeUtil.create( {
			override_key: ORIGIN_OVERRIDE_KEY,
			override_value: { $$type: 'string', value: 'New Value' },
			schema_source: { type: 'component', id: MOCK_COMPONENT_ID },
		} );
		const matchingOverride = null;

		// Act
		const result = correctExposedEmptyOverride( newPropValue, matchingOverride );

		// Assert
		expect( result ).toBe( newPropValue );
	} );
} );
