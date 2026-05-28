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

	it( 'draws N+M boundary lines for an N×M grid (no gaps)', () => {
		const { container } = renderWithTheme(
			<GridOutline
				tracks={ makeTracks( { columns: [ 100, 100, 100 ], rows: [ 80, 80 ] } ) }
				width={ 300 }
				height={ 160 }
			/>
		);

		expect( container.querySelectorAll( 'line' ) ).toHaveLength( 4 + 3 );
	} );

	it( 'emits both edges of every gap between tracks', () => {
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

		expect( container.querySelectorAll( 'line' ) ).toHaveLength( 6 + 4 );
	} );

	it( 'snaps vertical line coordinates to half pixels for crisp 1px strokes', () => {
		const { container } = renderWithTheme(
			<GridOutline
				tracks={ makeTracks( {
					columns: [ 100, 100 ],
					padding: { top: 10, right: 10, bottom: 10, left: 10 },
				} ) }
				width={ 220 }
				height={ 100 }
			/>
		);

		const verticals = Array.from( container.querySelectorAll( 'line' ) ).filter(
			( line ) => line.getAttribute( 'x1' ) === line.getAttribute( 'x2' )
		);

		expect( verticals.map( ( line ) => line.getAttribute( 'x1' ) ) ).toEqual( [ '10.5', '110.5', '210.5' ] );
	} );

	it( 'spans horizontal lines across the padded content rect', () => {
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

		const horizontals = Array.from( container.querySelectorAll( 'line' ) ).filter(
			( line ) => line.getAttribute( 'y1' ) === line.getAttribute( 'y2' )
		);

		expect( horizontals.length ).toBeGreaterThan( 0 );
		for ( const line of horizontals ) {
			expect( line ).toHaveAttribute( 'x1', '4' );
			expect( line ).toHaveAttribute( 'x2', '288' );
		}
	} );

	it( 'passes the resolved iframe border color through to each line', () => {
		const { container } = renderWithTheme(
			<GridOutline
				tracks={ makeTracks( { columns: [ 100 ], borderColor: '#abcdef' } ) }
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
