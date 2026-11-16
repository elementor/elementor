import { clamp, isEmptyDraft, isInRange, parseNumberDraft } from '../number-value';

describe( 'isEmptyDraft', () => {
	it.each( [ '', ' ', '   ' ] )( 'should treat %p as empty', ( raw ) => {
		expect( isEmptyDraft( raw ) ).toBe( true );
	} );

	it.each( [ '0', '-', '.', '1' ] )( 'should treat %p as not empty', ( raw ) => {
		expect( isEmptyDraft( raw ) ).toBe( false );
	} );
} );

describe( 'parseNumberDraft', () => {
	it.each( [
		[ '0', 0 ],
		[ '007', 7 ],
		[ '1.5', 1.5 ],
		[ '1.', 1 ],
		[ '-5', -5 ],
		[ '  12  ', 12 ],
	] )( 'should parse %p as %p', ( raw, expected ) => {
		expect( parseNumberDraft( raw ) ).toBe( expected );
	} );

	it.each( [ '', '   ', '-', '.', '-.', 'abc' ] )( 'should return null for unparseable %p', ( raw ) => {
		expect( parseNumberDraft( raw ) ).toBeNull();
	} );

	it( 'should truncate towards zero when shouldForceInt is set', () => {
		expect( parseNumberDraft( '1.9', true ) ).toBe( 1 );
		expect( parseNumberDraft( '-1.9', true ) ).toBe( -1 );
	} );
} );

describe( 'isInRange', () => {
	it.each( [
		[ 100, true ],
		[ 3000, true ],
		[ 600, true ],
		[ 99, false ],
		[ 3001, false ],
	] )( 'should report %p as in-range=%p for 100..3000', ( value, expected ) => {
		expect( isInRange( value, 100, 3000 ) ).toBe( expected );
	} );
} );

describe( 'clamp', () => {
	it.each( [
		[ 2, 100 ],
		[ 5000, 3000 ],
		[ 600, 600 ],
		[ 100, 100 ],
		[ 3000, 3000 ],
	] )( 'should clamp %p to %p within 100..3000', ( value, expected ) => {
		expect( clamp( value, 100, 3000 ) ).toBe( expected );
	} );
} );
