import { type PropType, type PropValue } from '../../types';
import { getCompatibleTypeKeys, migratePropValue, PROP_TYPE_COMPATIBILITY_MAP } from '../prop-type-compatibility';

describe( 'prop-type-compatibility', () => {
	describe( 'PROP_TYPE_COMPATIBILITY_MAP', () => {
		it( 'should have html and string compatibility', () => {
			expect( PROP_TYPE_COMPATIBILITY_MAP.html ).toEqual( [ 'string' ] );
			expect( PROP_TYPE_COMPATIBILITY_MAP.string ).toEqual( [ 'html' ] );
		} );
	} );

	describe( 'getCompatibleTypeKeys', () => {
		it( 'should return empty array for union types', () => {
			// Arrange.
			const unionPropType: PropType = {
				kind: 'union',
				prop_types: {
					string: {
						kind: 'plain',
						key: 'string',
						meta: {},
						settings: {},
					},
					html: {
						kind: 'plain',
						key: 'html',
						meta: {},
						settings: {},
					},
				},
				meta: {},
				settings: {},
			};

			// Act.
			const result = getCompatibleTypeKeys( unionPropType );

			// Assert.
			expect( result ).toEqual( [] );
		} );

		it( 'should return compatible keys from map for plain prop type', () => {
			// Arrange.
			const stringPropType: PropType = {
				kind: 'plain',
				key: 'string',
				meta: {},
				settings: {},
			};

			// Act.
			const result = getCompatibleTypeKeys( stringPropType );

			// Assert.
			expect( result ).toEqual( [ 'html' ] );
		} );

		it( 'should return compatible keys from meta when available', () => {
			// Arrange.
			const propType: PropType = {
				kind: 'plain',
				key: 'custom',
				meta: {
					compatibleTypeKeys: [ 'type1', 'type2' ],
				},
				settings: {},
			};

			// Act.
			const result = getCompatibleTypeKeys( propType );

			// Assert.
			expect( result ).toEqual( [ 'type1', 'type2' ] );
		} );

		it( 'should return empty array when no compatibility found', () => {
			// Arrange.
			const propType: PropType = {
				kind: 'plain',
				key: 'unknown',
				meta: {},
				settings: {},
			};

			// Act.
			const result = getCompatibleTypeKeys( propType );

			// Assert.
			expect( result ).toEqual( [] );
		} );
	} );

	describe( 'migratePropValue', () => {
		it( 'should return non-transformable value as-is', () => {
			// Arrange.
			const value: PropValue = 'plain string';
			const propType: PropType = {
				kind: 'plain',
				key: 'string',
				meta: {},
				settings: {},
			};

			// Act.
			const result = migratePropValue( value, propType );

			// Assert.
			expect( result ).toBe( value );
		} );

		it( 'should migrate string to html', () => {
			// Arrange.
			const value: PropValue = {
				$$type: 'string',
				value: 'Test content',
			};
			const propType: PropType = {
				kind: 'plain',
				key: 'html',
				meta: {},
				settings: {},
			};

			// Act.
			const result = migratePropValue( value, propType );

			// Assert.
			expect( result ).toEqual( {
				$$type: 'html',
				value: 'Test content',
			} );
		} );

		it( 'should migrate html to string', () => {
			// Arrange.
			const value: PropValue = {
				$$type: 'html',
				value: 'Test content',
			};
			const propType: PropType = {
				kind: 'plain',
				key: 'string',
				meta: {},
				settings: {},
			};

			// Act.
			const result = migratePropValue( value, propType );

			// Assert.
			expect( result ).toEqual( {
				$$type: 'string',
				value: 'Test content',
			} );
		} );

		it( 'should return value as-is when already matches expected type', () => {
			// Arrange.
			const value: PropValue = {
				$$type: 'html',
				value: 'Test content',
			};
			const propType: PropType = {
				kind: 'plain',
				key: 'html',
				meta: {},
				settings: {},
			};

			// Act.
			const result = migratePropValue( value, propType );

			// Assert.
			expect( result ).toBe( value );
		} );

		it( 'should return value as-is when not compatible', () => {
			// Arrange.
			const value: PropValue = {
				$$type: 'number',
				value: 123,
			};
			const propType: PropType = {
				kind: 'plain',
				key: 'string',
				meta: {},
				settings: {},
			};

			// Act.
			const result = migratePropValue( value, propType );

			// Assert.
			expect( result ).toBe( value );
		} );

		it( 'should preserve disabled flag when migrating', () => {
			// Arrange.
			const value: PropValue = {
				$$type: 'string',
				value: 'Test content',
				disabled: true,
			};
			const propType: PropType = {
				kind: 'plain',
				key: 'html',
				meta: {},
				settings: {},
			};

			// Act.
			const result = migratePropValue( value, propType );

			// Assert.
			expect( result ).toEqual( {
				$$type: 'html',
				value: 'Test content',
				disabled: true,
			} );
		} );

		it( 'should migrate for union type with matching sub-type', () => {
			// Arrange.
			const value: PropValue = {
				$$type: 'string',
				value: 'Test content',
			};
			const propType: PropType = {
				kind: 'union',
				prop_types: {
					html: {
						kind: 'plain',
						key: 'html',
						meta: {},
						settings: {},
					},
					string: {
						kind: 'plain',
						key: 'string',
						meta: {},
						settings: {},
					},
				},
				meta: {},
				settings: {},
			};

			// Act.
			const result = migratePropValue( value, propType );

			// Assert.
			expect( result ).toEqual( {
				$$type: 'html',
				value: 'Test content',
			} );
		} );

		it( 'should return value as-is for union type when already matches', () => {
			// Arrange.
			const value: PropValue = {
				$$type: 'html',
				value: 'Test content',
			};
			const propType: PropType = {
				kind: 'union',
				prop_types: {
					html: {
						kind: 'plain',
						key: 'html',
						meta: {},
						settings: {},
					},
					string: {
						kind: 'plain',
						key: 'string',
						meta: {},
						settings: {},
					},
				},
				meta: {},
				settings: {},
			};

			// Act.
			const result = migratePropValue( value, propType );

			// Assert.
			expect( result ).toBe( value );
		} );

		it( 'should return value as-is for union type when not compatible', () => {
			// Arrange.
			const value: PropValue = {
				$$type: 'number',
				value: 123,
			};
			const propType: PropType = {
				kind: 'union',
				prop_types: {
					html: {
						kind: 'plain',
						key: 'html',
						meta: {},
						settings: {},
					},
					string: {
						kind: 'plain',
						key: 'string',
						meta: {},
						settings: {},
					},
				},
				meta: {},
				settings: {},
			};

			// Act.
			const result = migratePropValue( value, propType );

			// Assert.
			expect( result ).toBe( value );
		} );

		it( 'should use meta compatibleTypeKeys when available', () => {
			// Arrange.
			const value: PropValue = {
				$$type: 'type1',
				value: 'Test content',
			};
			const propType: PropType = {
				kind: 'plain',
				key: 'custom',
				meta: {
					compatibleTypeKeys: [ 'type1', 'type2' ],
				},
				settings: {},
			};

			// Act.
			const result = migratePropValue( value, propType );

			// Assert.
			expect( result ).toEqual( {
				$$type: 'custom',
				value: 'Test content',
			} );
		} );

		it( 'should handle empty string value', () => {
			// Arrange.
			const value: PropValue = {
				$$type: 'string',
				value: '',
			};
			const propType: PropType = {
				kind: 'plain',
				key: 'html',
				meta: {},
				settings: {},
			};

			// Act.
			const result = migratePropValue( value, propType );

			// Assert.
			expect( result ).toEqual( {
				$$type: 'html',
				value: '',
			} );
		} );

		it( 'should handle null value', () => {
			// Arrange.
			const value: PropValue = null;
			const propType: PropType = {
				kind: 'plain',
				key: 'string',
				meta: {},
				settings: {},
			};

			// Act.
			const result = migratePropValue( value, propType );

			// Assert.
			expect( result ).toBeNull();
		} );

		it( 'should handle undefined value', () => {
			// Arrange.
			const value: PropValue = undefined;
			const propType: PropType = {
				kind: 'plain',
				key: 'string',
				meta: {},
				settings: {},
			};

			// Act.
			const result = migratePropValue( value, propType );

			// Assert.
			expect( result ).toBeUndefined();
		} );
	} );
} );
