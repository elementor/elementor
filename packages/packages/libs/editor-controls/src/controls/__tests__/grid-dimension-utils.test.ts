import {
	GRID_DIMENSION_MAX,
	GRID_DIMENSION_MIN,
	clampGridDimension,
	countsFromMatrixCell,
	isMatrixCellActive,
	parseClampedGridDimension,
} from '../grid-dimension-utils';

describe( 'grid-dimension-utils', () => {
	describe( 'clampGridDimension', () => {
		it( 'clamps below min to min', () => {
			expect( clampGridDimension( 0 ) ).toBe( GRID_DIMENSION_MIN );
			expect( clampGridDimension( -5 ) ).toBe( GRID_DIMENSION_MIN );
		} );

		it( 'clamps above max to max', () => {
			expect( clampGridDimension( 100 ) ).toBe( GRID_DIMENSION_MAX );
		} );

		it( 'leaves in-range values unchanged', () => {
			expect( clampGridDimension( 12 ) ).toBe( 12 );
		} );
	} );

	describe( 'parseClampedGridDimension', () => {
		it( 'uses fallback for non-numeric values', () => {
			expect( parseClampedGridDimension( null, 3 ) ).toBe( 3 );
			expect( parseClampedGridDimension( 'x', 3 ) ).toBe( 3 );
		} );

		it( 'clamps numeric input', () => {
			expect( parseClampedGridDimension( 0, 3 ) ).toBe( GRID_DIMENSION_MIN );
			expect( parseClampedGridDimension( 30, 3 ) ).toBe( GRID_DIMENSION_MAX );
		} );
	} );

	describe( 'isMatrixCellActive', () => {
		it( 'returns true inside rectangle', () => {
			expect( isMatrixCellActive( 0, 0, 3, 2 ) ).toBe( true );
			expect( isMatrixCellActive( 2, 1, 3, 2 ) ).toBe( true );
		} );

		it( 'returns false outside rectangle', () => {
			expect( isMatrixCellActive( 3, 0, 3, 2 ) ).toBe( false );
			expect( isMatrixCellActive( 0, 2, 3, 2 ) ).toBe( false );
		} );
	} );

	describe( 'countsFromMatrixCell', () => {
		it( 'maps 0-based indices to 1-based counts', () => {
			expect( countsFromMatrixCell( 0, 0 ) ).toEqual( { columns: 1, rows: 1 } );
			expect( countsFromMatrixCell( 4, 3 ) ).toEqual( { columns: 5, rows: 4 } );
		} );
	} );
} );
