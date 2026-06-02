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

	it( 'draws one rect per cell for an N×M grid', () => {
		const { container } = renderWithTheme(
			<GridOutline
				tracks={ makeTracks( { columns: [ 100, 100, 100 ], rows: [ 80, 80 ] } ) }
				width={ 300 }
				height={ 160 }
			/>
		);

		expect( container.querySelectorAll( 'rect' ) ).toHaveLength( 3 * 2 );
	} );

	it( 'keeps the cell count stable with a gap and offsets cells past the gap', () => {
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

		const rects = Array.from( container.querySelectorAll( 'rect' ) );
		expect( rects ).toHaveLength( 3 * 2 );

		const xs = rects.map( ( rect ) => rect.getAttribute( 'x' ) );
		expect( xs ).toContain( '0.5' );
		expect( xs ).toContain( '110.5' );
		expect( xs ).toContain( '220.5' );
	} );

	it( 'snaps cell coordinates to half pixels for crisp 1px strokes', () => {
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

		const xs = Array.from( container.querySelectorAll( 'rect' ) ).map( ( rect ) => rect.getAttribute( 'x' ) );
		expect( xs ).toEqual( [ '10.5', '110.5' ] );
	} );

	it( 'spans a single full-width cell per row when only rows are defined', () => {
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

		const rects = Array.from( container.querySelectorAll( 'rect' ) );
		expect( rects ).toHaveLength( 2 );
		for ( const rect of rects ) {
			expect( rect ).toHaveAttribute( 'x', '4.5' );
			expect( rect ).toHaveAttribute( 'width', '284' );
		}
	} );

	it( 'passes the resolved iframe border color through to each cell', () => {
		const { container } = renderWithTheme(
			<GridOutline
				tracks={ makeTracks( { columns: [ 100 ], rows: [ 100 ], borderColor: '#abcdef' } ) }
				width={ 100 }
				height={ 100 }
			/>
		);

		const rects = container.querySelectorAll( 'rect' );
		expect( rects.length ).toBeGreaterThan( 0 );
		rects.forEach( ( rect ) => {
			expect( rect ).toHaveAttribute( 'stroke', '#abcdef' );
		} );
	} );

	it( 'renders no cells when there are no tracks on either axis', () => {
		const { container } = renderWithTheme( <GridOutline tracks={ makeTracks() } width={ 100 } height={ 100 } /> );

		expect( container.querySelectorAll( 'rect' ) ).toHaveLength( 0 );
	} );
} );
