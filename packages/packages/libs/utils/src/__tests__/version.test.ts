import { compareVersions, isVersionGreaterOrEqual, isVersionLessThan } from '../version';

describe( 'compareVersions', () => {
	it.each( [
		{ a: '3.35.0', b: '3.35.0', expected: 0, label: 'identical versions' },
		{ a: 3, b: 2, expected: 1, label: 'numeric inputs' },
		{ a: '3.35', b: '3.35.0', expected: 0, label: 'different segment lengths' },
		{ a: '', b: '1.0.0', expected: -1, label: 'empty string as 0.0.0' },
	] )( 'should handle $label', ( { a, b, expected } ) => {
		const result = compareVersions( a, b );
		if ( expected === 0 ) {
			expect( result ).toBe( 0 );
		} else if ( expected === -1 ) {
			expect( result ).toBeLessThan( 0 );
		} else {
			expect( result ).toBeGreaterThan( 0 );
		}
	} );
} );

describe( 'isVersionLessThan', () => {
	it.each( [
		{ a: '3.34.0', b: '3.35.0', expected: true },
		{ a: '3.35.0', b: '3.35.0', expected: false },
		{ a: '3.36.0', b: '3.35.0', expected: false },
	] )( 'should return $expected for $a < $b', ( { a, b, expected } ) => {
		expect( isVersionLessThan( a, b ) ).toBe( expected );
	} );
} );

describe( 'isVersionGreaterOrEqual', () => {
	it.each( [
		{ a: '3.36.0', b: '3.35.0', expected: true },
		{ a: '3.35.0', b: '3.35.0', expected: true },
		{ a: '3.34.0', b: '3.35.0', expected: false },
	] )( 'should return $expected for $a >= $b', ( { a, b, expected } ) => {
		expect( isVersionGreaterOrEqual( a, b ) ).toBe( expected );
	} );
} );
