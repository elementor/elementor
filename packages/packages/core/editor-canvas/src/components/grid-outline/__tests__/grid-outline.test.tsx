/* eslint-disable testing-library/no-container */
import * as React from 'react';
import { renderWithTheme } from 'test-utils';

import { type GridTracks } from '../../../hooks/use-grid-tracks';
import { GridOutline } from '../grid-outline';

function makeTracks( partial: Partial< GridTracks > = {} ): GridTracks {
	return {
		columns: [],
		rows: [],
		columnGap: 0,
		rowGap: 0,
		padding: { top: 0, right: 0, bottom: 0, left: 0 },
		borderColor: '#D5D8DC',
		...partial,
	};
}

function getSvg( container: HTMLElement ): SVGSVGElement {
	const svg = container.querySelector( 'svg' );
	if ( ! svg ) {
		throw new Error( 'svg not found' );
	}
	return svg;
}

describe( '<GridOutline />', () => {
	it( 'sizes the svg to the element rect', () => {
		const { container } = renderWithTheme(
			<GridOutline tracks={ makeTracks( { columns: [ 100 ] } ) } width={ 320 } height={ 200 } />
		);

		const svg = getSvg( container );
		expect( svg ).toHaveAttribute( 'width', '320' );
		expect( svg ).toHaveAttribute( 'height', '200' );
	} );

	it( 'draws one line per unique boundary for an N×M grid with no gap', () => {
		const { container } = renderWithTheme(
			<GridOutline
				tracks={ makeTracks( { columns: [ 100, 100, 100 ], rows: [ 80, 80 ] } ) }
				width={ 300 }
				height={ 160 }
			/>
		);

		const lines = container.querySelectorAll( 'line' );
		expect( lines ).toHaveLength( 4 + 3 );
	} );

	it( 'splits inner boundaries into two parallel lines when a gap is set', () => {
		const { container } = renderWithTheme(
			<GridOutline
				tracks={ makeTracks( {
					columns: [ 100, 100, 100 ],
					rows: [ 80, 80 ],
					columnGap: 10,
					rowGap: 8,
				} ) }
				width={ 320 }
				height={ 176 }
			/>
		);

		const lines = Array.from( container.querySelectorAll( 'line' ) );

		const verticalXs = lines
			.filter( ( line ) => line.getAttribute( 'x1' ) === line.getAttribute( 'x2' ) )
			.map( ( line ) => line.getAttribute( 'x1' ) );
		expect( verticalXs ).toEqual( [ '0.5', '100.5', '110.5', '210.5', '220.5', '320.5' ] );

		const horizontalYs = lines
			.filter( ( line ) => line.getAttribute( 'y1' ) === line.getAttribute( 'y2' ) )
			.map( ( line ) => line.getAttribute( 'y1' ) );
		expect( horizontalYs ).toEqual( [ '0.5', '80.5', '88.5', '168.5' ] );
	} );

	it( 'snaps line coordinates to half pixels for crisp 1px strokes', () => {
		const { container } = renderWithTheme(
			<GridOutline
				tracks={ makeTracks( {
					columns: [ 100, 100 ],
					rows: [ 80 ],
					padding: { top: 10, right: 10, bottom: 10, left: 10 },
				} ) }
				width={ 220 }
				height={ 100 }
			/>
		);

		const verticalXs = Array.from( container.querySelectorAll( 'line' ) )
			.filter( ( line ) => line.getAttribute( 'x1' ) === line.getAttribute( 'x2' ) )
			.map( ( line ) => line.getAttribute( 'x1' ) );
		expect( verticalXs ).toEqual( [ '10.5', '110.5', '210.5' ] );
	} );

	it( 'spans a single full-width band per row when only rows are defined', () => {
		const { container } = renderWithTheme(
			<GridOutline
				tracks={ makeTracks( {
					rows: [ 50, 50 ],
					padding: { top: 8, right: 12, bottom: 6, left: 4 },
				} ) }
				width={ 300 }
				height={ 120 }
			/>
		);

		const lines = Array.from( container.querySelectorAll( 'line' ) );
		const horizontals = lines.filter( ( line ) => line.getAttribute( 'y1' ) === line.getAttribute( 'y2' ) );
		expect( horizontals ).toHaveLength( 3 );
		for ( const line of horizontals ) {
			expect( line ).toHaveAttribute( 'x1', '4' );
			expect( line ).toHaveAttribute( 'x2', '288' );
		}
	} );

	it( 'passes the resolved iframe border color through to each line', () => {
		const { container } = renderWithTheme(
			<GridOutline
				tracks={ makeTracks( { columns: [ 100 ], rows: [ 100 ], borderColor: '#abcdef' } ) }
				width={ 100 }
				height={ 100 }
			/>
		);

		const lines = container.querySelectorAll( 'line' );
		expect( lines.length ).toBeGreaterThan( 0 );
		lines.forEach( ( line ) => {
			expect( line ).toHaveAttribute( 'stroke', '#abcdef' );
		} );
	} );

	it( 'renders no lines when there are no tracks on either axis', () => {
		const { container } = renderWithTheme( <GridOutline tracks={ makeTracks() } width={ 100 } height={ 100 } /> );

		expect( container.querySelectorAll( 'line' ) ).toHaveLength( 0 );
	} );
} );
