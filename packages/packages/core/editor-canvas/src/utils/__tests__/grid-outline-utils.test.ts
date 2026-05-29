import { type GridTracks } from '../../hooks/use-grid-tracks';
import { computeOutlineGeometry, parseTrackList, snapToHalfPixel, toGridTracks, toPx } from '../grid-outline-utils';

function makeTracks( partial: Partial< GridTracks > = {} ): GridTracks {
	return {
		columns: [],
		rows: [],
		columnGap: 0,
		rowGap: 0,
		padding: { top: 0, right: 0, bottom: 0, left: 0 },
		borderColor: '',
		...partial,
	};
}

describe( 'computeOutlineGeometry', () => {
	it( 'returns empty boundary lists when there are no tracks', () => {
		const geometry = computeOutlineGeometry( makeTracks(), 100, 100 );

		expect( geometry.vertical ).toEqual( [] );
		expect( geometry.horizontal ).toEqual( [] );
	} );

	it( 'shifts boundaries by the padding offset on each axis', () => {
		const tracks = makeTracks( {
			columns: [ 100, 100 ],
			rows: [ 80, 80 ],
			padding: { top: 5, right: 0, bottom: 0, left: 20 },
		} );

		const geometry = computeOutlineGeometry( tracks, 300, 300 );

		expect( geometry.vertical ).toEqual( [ 20, 120, 220 ] );
		expect( geometry.horizontal ).toEqual( [ 5, 85, 165 ] );
	} );

	it( 'emits both edges of every gap between tracks', () => {
		const tracks = makeTracks( {
			columns: [ 100, 100, 100 ],
			columnGap: 10,
		} );

		const geometry = computeOutlineGeometry( tracks, 400, 100 );

		// 0 — 100 [gap 10] 110 — 210 [gap 10] 220 — 320
		expect( geometry.vertical ).toEqual( [ 0, 100, 110, 210, 220, 320 ] );
	} );

	it( 'collapses gap boundaries when the gap is zero', () => {
		const tracks = makeTracks( {
			rows: [ 50, 50, 50 ],
			rowGap: 0,
		} );

		const geometry = computeOutlineGeometry( tracks, 100, 200 );

		expect( geometry.horizontal ).toEqual( [ 0, 50, 100, 150 ] );
	} );

	it( 'handles uneven track sizes', () => {
		const tracks = makeTracks( {
			columns: [ 100, 200, 100 ],
			columnGap: 5,
			padding: { top: 0, right: 0, bottom: 0, left: 10 },
		} );

		const geometry = computeOutlineGeometry( tracks, 500, 100 );

		// 10 — 110 [5] 115 — 315 [5] 320 — 420
		expect( geometry.vertical ).toEqual( [ 10, 110, 115, 315, 320, 420 ] );
	} );

	it( 'derives the content rect from element size and padding', () => {
		const tracks = makeTracks( {
			padding: { top: 5, right: 8, bottom: 12, left: 20 },
		} );

		const geometry = computeOutlineGeometry( tracks, 300, 200 );

		expect( geometry.top ).toBe( 5 );
		expect( geometry.left ).toBe( 20 );
		expect( geometry.right ).toBe( 292 );
		expect( geometry.bottom ).toBe( 188 );
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
		[ 'normal', 0 ],
		[ '', 0 ],
		[ 'auto', 0 ],
	] )( 'parses %p as %p', ( input, expected ) => {
		expect( toPx( input ) ).toBe( expected );
	} );
} );

type ComputedStyleParts = {
	gridTemplateColumns: string;
	gridTemplateRows: string;
	columnGap: string;
	rowGap: string;
	paddingTop: string;
	paddingRight: string;
	paddingBottom: string;
	paddingLeft: string;
	borderColor: string;
};

function mockComputedStyle( parts: Partial< ComputedStyleParts > = {} ): CSSStyleDeclaration {
	const resolved: ComputedStyleParts = {
		gridTemplateColumns: 'none',
		gridTemplateRows: 'none',
		columnGap: 'normal',
		rowGap: 'normal',
		paddingTop: '0px',
		paddingRight: '0px',
		paddingBottom: '0px',
		paddingLeft: '0px',
		borderColor: '',
		...parts,
	};

	return {
		gridTemplateColumns: resolved.gridTemplateColumns,
		gridTemplateRows: resolved.gridTemplateRows,
		columnGap: resolved.columnGap,
		rowGap: resolved.rowGap,
		paddingTop: resolved.paddingTop,
		paddingRight: resolved.paddingRight,
		paddingBottom: resolved.paddingBottom,
		paddingLeft: resolved.paddingLeft,
		getPropertyValue: ( name: string ) => ( name === '--e-a-border-color-bold' ? resolved.borderColor : '' ),
	} as unknown as CSSStyleDeclaration;
}

describe( 'toGridTracks', () => {
	it( 'parses resolved track lists, gaps, and padding from computed style', () => {
		const tracks = toGridTracks(
			mockComputedStyle( {
				gridTemplateColumns: '100px 100px 100px',
				gridTemplateRows: '80px 80px',
				columnGap: '10px',
				rowGap: '8px',
				paddingTop: '5px',
				paddingRight: '6px',
				paddingBottom: '7px',
				paddingLeft: '8px',
			} )
		);

		expect( tracks ).toEqual( {
			columns: [ 100, 100, 100 ],
			rows: [ 80, 80 ],
			columnGap: 10,
			rowGap: 8,
			padding: { top: 5, right: 6, bottom: 7, left: 8 },
			borderColor: '',
		} );
	} );

	it( 'returns empty track lists when the template is "none"', () => {
		const tracks = toGridTracks( mockComputedStyle() );

		expect( tracks.columns ).toEqual( [] );
		expect( tracks.rows ).toEqual( [] );
	} );

	it( 'reports gap as 0 when computed style returns "normal"', () => {
		const tracks = toGridTracks(
			mockComputedStyle( { gridTemplateColumns: '100px 100px', columnGap: 'normal', rowGap: 'normal' } )
		);

		expect( tracks.columnGap ).toBe( 0 );
		expect( tracks.rowGap ).toBe( 0 );
	} );

	it( 'trims the --e-a-border-color-bold CSS variable', () => {
		const tracks = toGridTracks( mockComputedStyle( { borderColor: '  #d5d8dc  ' } ) );

		expect( tracks.borderColor ).toBe( '#d5d8dc' );
	} );
} );
