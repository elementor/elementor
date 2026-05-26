import { computeBoundaries, parseTrackList, snapToHalfPixel, toPx } from '../grid-outline-utils';

describe( 'computeBoundaries', () => {
	it( 'returns an empty list when there are no tracks', () => {
		expect( computeBoundaries( [], 8, 0 ) ).toEqual( [] );
	} );

	it( 'returns the outer edges for a single track with no gap', () => {
		expect( computeBoundaries( [ 100 ], 0, 0 ) ).toEqual( [ 0, 100 ] );
	} );

	it( 'returns both edges of every gap between tracks', () => {
		// 3 tracks of 100px, 10px gaps, starting offset 0:
		// 0 — 100 [gap 10] 110 — 210 [gap 10] 220 — 320
		expect( computeBoundaries( [ 100, 100, 100 ], 10, 0 ) ).toEqual( [ 0, 100, 110, 210, 220, 320 ] );
	} );

	it( 'collapses gap boundaries when gap is zero', () => {
		expect( computeBoundaries( [ 50, 50, 50 ], 0, 0 ) ).toEqual( [ 0, 50, 100, 150 ] );
	} );

	it( 'shifts every boundary by the offset', () => {
		expect( computeBoundaries( [ 100, 100 ], 10, 20 ) ).toEqual( [ 20, 120, 130, 230 ] );
	} );

	it( 'handles uneven track sizes', () => {
		// 1fr + 200px + 1fr resolved to e.g. 100, 200, 100 with a 5px gap and offset 10:
		// 10 — 110 [5] 115 — 315 [5] 320 — 420
		expect( computeBoundaries( [ 100, 200, 100 ], 5, 10 ) ).toEqual( [ 10, 110, 115, 315, 320, 420 ] );
	} );
} );

describe( 'snapToHalfPixel', () => {
	it.each( [
		[ 0, 0.5 ],
		[ 0.4, 0.5 ],
		[ 0.6, 1.5 ],
		[ 99.2, 99.5 ],
		[ 100, 100.5 ],
		[ -0.4, 0.5 ],
		[ -1.6, -1.5 ],
	] )( 'snaps %p to %p for crisp 1px strokes', ( input, expected ) => {
		expect( snapToHalfPixel( input ) ).toBe( expected );
	} );
} );

describe( 'parseTrackList', () => {
	it( 'returns an empty list for empty input', () => {
		expect( parseTrackList( '' ) ).toEqual( [] );
	} );

	it( 'returns an empty list for the "none" keyword', () => {
		expect( parseTrackList( 'none' ) ).toEqual( [] );
	} );

	it( 'parses a single resolved px track', () => {
		expect( parseTrackList( '200px' ) ).toEqual( [ 200 ] );
	} );

	it( 'parses multiple resolved px tracks', () => {
		expect( parseTrackList( '100px 200px 100px' ) ).toEqual( [ 100, 200, 100 ] );
	} );

	it( 'parses fractional pixel sizes', () => {
		expect( parseTrackList( '99.5px 100.25px' ) ).toEqual( [ 99.5, 100.25 ] );
	} );

	it( 'collapses runs of whitespace between tracks', () => {
		expect( parseTrackList( '  100px   200px\t300px ' ) ).toEqual( [ 100, 200, 300 ] );
	} );

	it( 'drops zero-width entries (e.g. tracks resolved to 0)', () => {
		expect( parseTrackList( '100px 0px 200px' ) ).toEqual( [ 100, 200 ] );
	} );
} );

describe( 'toPx', () => {
	it.each( [
		[ '0px', 0 ],
		[ '10px', 10 ],
		[ '99.5px', 99.5 ],
		[ 'normal', 0 ], // gap reports "normal" when there is no gap
		[ '', 0 ],
		[ 'auto', 0 ],
	] )( 'parses %p as %p', ( input, expected ) => {
		expect( toPx( input ) ).toBe( expected );
	} );
} );
