import { componentOverridablePropTypeUtil } from '../component-overridable-prop-type';

describe( 'componentOverridablePropTypeUtil', () => {
	it( 'should treat an exposed prop with no value as valid when origin_value is null', () => {
		// Arrange
		const prop = {
			$$type: 'overridable',
			value: { override_key: 'source', origin_value: null },
		};

		// Act
		const result = componentOverridablePropTypeUtil.extract( prop );

		// Assert
		expect( result ).toEqual( { override_key: 'source', origin_value: null } );
	} );

	it( 'should reject an empty origin_value, so the prop reads as never exposed', () => {
		// Arrange
		const prop = {
			$$type: 'overridable',
			value: { override_key: 'source', origin_value: {} },
		};

		// Act
		const result = componentOverridablePropTypeUtil.extract( prop );

		// Assert
		expect( result ).toBeNull();
	} );
} );
