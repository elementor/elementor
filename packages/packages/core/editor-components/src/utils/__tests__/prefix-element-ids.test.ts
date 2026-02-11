import { createMockElementData } from 'test-utils';

import { generateShortHash } from '../hash-string';
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

	it( 'should prefix IDs with hashed prefix for flat elements', () => {
		// Arrange
		const elements = [ createMockElementData( { id: 'aaa' } ), createMockElementData( { id: 'bbb' } ) ];
		const prefix = 'inst1';
		const expectedHash = generateShortHash( prefix, 7 );

		// Act
		const result = prefixElementIds( elements, prefix );

		// Assert
		expect( result[ 0 ].id ).toBe( `${ expectedHash }_aaa` );
		expect( result[ 1 ].id ).toBe( `${ expectedHash }_bbb` );
		expect( result[ 0 ].originId ).toBe( 'aaa' );
		expect( result[ 1 ].originId ).toBe( 'bbb' );
	} );

	it( 'should prefix IDs recursively in nested elements with same hash', () => {
		// Arrange
		const elements = [
			createMockElementData( {
				id: 'parent',
				elements: [
					createMockElementData( {
						id: 'child',
						elements: [ createMockElementData( { id: 'grandchild' } ) ],
					} ),
				],
			} ),
		];
		const prefix = 'inst1';
		const expectedHash = generateShortHash( prefix, 7 );

		// Act
		const result = prefixElementIds( elements, prefix );

		// Assert
		expect( result[ 0 ].id ).toBe( `${ expectedHash }_parent` );
		expect( result[ 0 ].elements?.[ 0 ].id ).toBe( `${ expectedHash }_child` );
		expect( result[ 0 ].elements?.[ 0 ].elements?.[ 0 ].id ).toBe( `${ expectedHash }_grandchild` );
		expect( result[ 0 ].originId ).toBe( 'parent' );
		expect( result[ 0 ].elements?.[ 0 ].originId ).toBe( 'child' );
		expect( result[ 0 ].elements?.[ 0 ].elements?.[ 0 ].originId ).toBe( 'grandchild' );
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

	it( 'should generate consistent short hash for nested component chains', () => {
		// Arrange
		const elements = [ createMockElementData( { id: 'elem1' } ) ];
		const shortChain = 'instA';
		const longChain = 'instA_instB_instC_instD_instE';

		// Act
		const resultShort = prefixElementIds( elements, shortChain );
		const resultLong = prefixElementIds( elements, longChain );

		// Assert - both should have same format: {hash}_elem1 (hash is max 7 chars)
		const shortIdParts = resultShort[ 0 ].id.split( '_' );
		const longIdParts = resultLong[ 0 ].id.split( '_' );

		expect( shortIdParts[ 0 ].length ).toBeLessThanOrEqual( 7 );
		expect( longIdParts[ 0 ].length ).toBeLessThanOrEqual( 7 );
		expect( shortIdParts[ 1 ] ).toBe( 'elem1' );
		expect( longIdParts[ 1 ] ).toBe( 'elem1' );
		
		// Hash length should be similar regardless of input length
		const lengthDiff = Math.abs( shortIdParts[ 0 ].length - longIdParts[ 0 ].length );
		expect( lengthDiff ).toBeLessThanOrEqual( 2 );
	} );

	it( 'should generate deterministic hashes (same input = same output)', () => {
		// Arrange
		const elements = [ createMockElementData( { id: 'test' } ) ];
		const prefix = 'instance-abc';

		// Act
		const result1 = prefixElementIds( elements, prefix );
		const result2 = prefixElementIds( elements, prefix );

		// Assert
		expect( result1[ 0 ].id ).toBe( result2[ 0 ].id );
	} );

	it( 'should generate different hashes for different prefixes', () => {
		// Arrange
		const elements = [ createMockElementData( { id: 'test' } ) ];

		// Act
		const result1 = prefixElementIds( elements, 'prefix-a' );
		const result2 = prefixElementIds( elements, 'prefix-b' );

		// Assert
		expect( result1[ 0 ].id ).not.toBe( result2[ 0 ].id );
	} );
} );
