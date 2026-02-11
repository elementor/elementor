import { createMockElementData } from 'test-utils';

import { prefixElementIds } from '../prefix-element-ids';

describe( 'prefixElementIds', () => {
	it( 'should return empty array when given empty elements', () => {
		// Arrange
		const elements = [];

		// Act
		const result = prefixElementIds( elements, 'prefix123' );

		// Assert
		expect( result ).toEqual( [] );
	} );

	it( 'should prefix IDs of flat elements', () => {
		// Arrange
		const elements = [
			createMockElementData( { id: 'aaa' } ),
			createMockElementData( { id: 'bbb' } ),
		];

		// Act
		const result = prefixElementIds( elements, 'inst1' );

		// Assert
		expect( result[ 0 ].id ).toBe( 'inst1_aaa' );
		expect( result[ 1 ].id ).toBe( 'inst1_bbb' );
	} );

	it( 'should prefix IDs recursively in nested elements', () => {
		// Arrange
		const elements = [
			createMockElementData( {
				id: 'parent',
				elements: [
					createMockElementData( {
						id: 'child',
						elements: [
							createMockElementData( { id: 'grandchild' } ),
						],
					} ),
				],
			} ),
		];

		// Act
		const result = prefixElementIds( elements, 'inst1' );

		// Assert
		expect( result[ 0 ].id ).toBe( 'inst1_parent' );
		expect( result[ 0 ].elements?.[ 0 ].id ).toBe( 'inst1_child' );
		expect( result[ 0 ].elements?.[ 0 ].elements?.[ 0 ].id ).toBe( 'inst1_grandchild' );
	} );

	it( 'should not mutate the original elements', () => {
		// Arrange
		const original = createMockElementData( { id: 'abc' } );
		const elements = [ original ];

		// Act
		prefixElementIds( elements, 'inst1' );

		// Assert
		expect( original.id ).toBe( 'abc' );
	} );

	it( 'should preserve all non-id properties', () => {
		// Arrange
		const elements = [
			createMockElementData( {
				id: 'elem1',
				widgetType: 'e-heading',
				settings: { text: 'hello' },
			} ),
		];

		// Act
		const result = prefixElementIds( elements, 'prefix' );

		// Assert
		expect( result[ 0 ].widgetType ).toBe( 'e-heading' );
		expect( result[ 0 ].settings ).toEqual( { text: 'hello' } );
	} );

	it( 'should handle chained prefix for nested components', () => {
		// Arrange
		const elements = [
			createMockElementData( { id: 'elem1' } ),
		];

		// Act
		const result = prefixElementIds( elements, 'instA_instB' );

		// Assert
		expect( result[ 0 ].id ).toBe( 'instA_instB_elem1' );
	} );
} );
