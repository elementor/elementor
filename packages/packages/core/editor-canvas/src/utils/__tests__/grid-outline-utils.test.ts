import { type GridTracks } from '../../hooks/use-grid-tracks';
import {
	computeCellRects,
	computeGridLines,
	parseTrackList,
	snapToHalfPixel,
	toGridTracks,
	toPx,
} from '../grid-outline-utils';

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

describe( 'computeCellRects', () => {
	it( 'returns no cells when there are no tracks on either axis', () => {
		expect( computeCellRects( makeTracks(), 100, 100 ) ).toEqual( [] );
	} );

	it( 'produces one rect per cell offset by the padding', () => {
		const tracks = makeTracks( {
			columns: [ 100, 100 ],
			rows: [ 80, 80 ],
			padding: { top: 5, right: 0, bottom: 0, left: 20 },
		} );

		expect( computeCellRects( tracks, 300, 300 ) ).toEqual( [
			{ x: 20, y: 5, width: 100, height: 80 },
			{ x: 120, y: 5, width: 100, height: 80 },
			{ x: 20, y: 85, width: 100, height: 80 },
			{ x: 120, y: 85, width: 100, height: 80 },
		] );
	} );

	it( 'separates cells by the gap so the gap stays empty', () => {
		const tracks = makeTracks( {
			columns: [ 100, 100, 100 ],
			rows: [ 80 ],
			columnGap: 10,
		} );

		expect( computeCellRects( tracks, 400, 100 ) ).toEqual( [
			{ x: 0, y: 0, width: 100, height: 80 },
			{ x: 110, y: 0, width: 100, height: 80 },
			{ x: 220, y: 0, width: 100, height: 80 },
		] );
	} );

	it( 'handles uneven track sizes', () => {
		const tracks = makeTracks( {
			columns: [ 100, 200, 100 ],
			rows: [ 50 ],
			columnGap: 5,
			padding: { top: 0, right: 0, bottom: 0, left: 10 },
		} );

		expect( computeCellRects( tracks, 500, 100 ) ).toEqual( [
			{ x: 10, y: 0, width: 100, height: 50 },
			{ x: 115, y: 0, width: 200, height: 50 },
			{ x: 320, y: 0, width: 100, height: 50 },
		] );
	} );

	it( 'spans a single full-width cell per row when only rows are defined', () => {
		const tracks = makeTracks( {
			rows: [ 50, 50 ],
			padding: { top: 8, right: 12, bottom: 6, left: 4 },
		} );

		expect( computeCellRects( tracks, 300, 120 ) ).toEqual( [
			{ x: 4, y: 8, width: 284, height: 50 },
			{ x: 4, y: 58, width: 284, height: 50 },
		] );
	} );

	it( 'spans a single full-height cell per column when only columns are defined', () => {
		const tracks = makeTracks( {
			columns: [ 100, 100 ],
			padding: { top: 5, right: 8, bottom: 12, left: 20 },
		} );

		expect( computeCellRects( tracks, 300, 200 ) ).toEqual( [
			{ x: 20, y: 5, width: 100, height: 183 },
			{ x: 120, y: 5, width: 100, height: 183 },
		] );
	} );
} );

describe( 'computeGridLines', () => {
	it( 'returns no lines when there are no tracks', () => {
		expect( computeGridLines( makeTracks(), 100, 100 ) ).toEqual( { vertical: [], horizontal: [] } );
	} );

	it( 'collapses shared boundaries into a single line when there is no gap', () => {
		const tracks = makeTracks( { columns: [ 100, 100, 100 ], rows: [ 80, 80 ] } );

		const lines = computeGridLines( tracks, 300, 160 );

		expect( lines.vertical.map( ( l ) => l.x1 ) ).toEqual( [ 0, 100, 200, 300 ] );
		expect( lines.horizontal.map( ( l ) => l.y1 ) ).toEqual( [ 0, 80, 160 ] );
	} );

	it( 'splits the inner boundary into two parallel lines when a gap is set', () => {
		const tracks = makeTracks( {
			columns: [ 100, 100, 100 ],
			rows: [ 80, 80 ],
			columnGap: 10,
			rowGap: 8,
		} );

		const lines = computeGridLines( tracks, 320, 176 );

		expect( lines.vertical.map( ( l ) => l.x1 ) ).toEqual( [ 0, 100, 110, 210, 220, 320 ] );
		expect( lines.horizontal.map( ( l ) => l.y1 ) ).toEqual( [ 0, 80, 88, 168 ] );
	} );

	it( 'extends vertical lines from the top to the bottom of the row span', () => {
		const tracks = makeTracks( { columns: [ 100, 100 ], rows: [ 50, 60 ], rowGap: 5 } );

		const lines = computeGridLines( tracks, 200, 115 );

		for ( const line of lines.vertical ) {
			expect( line.y1 ).toBe( 0 );
			expect( line.y2 ).toBe( 115 );
		}
	} );

	it( 'extends horizontal lines from the left to the right of the column span', () => {
		const tracks = makeTracks( { columns: [ 100, 100 ], rows: [ 50, 50 ], columnGap: 10 } );

		const lines = computeGridLines( tracks, 210, 100 );

		for ( const line of lines.horizontal ) {
			expect( line.x1 ).toBe( 0 );
			expect( line.x2 ).toBe( 210 );
		}
	} );

	it( 'offsets the lines by the grid padding', () => {
		const tracks = makeTracks( {
			columns: [ 100 ],
			rows: [ 80 ],
			padding: { top: 5, right: 4, bottom: 3, left: 20 },
		} );

		const lines = computeGridLines( tracks, 200, 100 );

		expect( lines.vertical.map( ( l ) => l.x1 ) ).toEqual( [ 20, 120 ] );
		expect( lines.horizontal.map( ( l ) => l.y1 ) ).toEqual( [ 5, 85 ] );
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
