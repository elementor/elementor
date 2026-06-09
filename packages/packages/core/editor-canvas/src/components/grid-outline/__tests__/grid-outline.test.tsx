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
			<GridOutline element={ null } tracks={ makeTracks( { columns: [ 100 ] } ) } width={ 320 } height={ 200 } />
		);

		const svg = getSvg( container );
		expect( svg ).toHaveAttribute( 'width', '320' );
		expect( svg ).toHaveAttribute( 'height', '200' );
	} );

	describe( 'no gap', () => {
		it( 'draws one line per unique boundary for an N×M grid', () => {
			const { container } = renderWithTheme(
				<GridOutline
					element={ null }
					tracks={ makeTracks( { columns: [ 100, 100, 100 ], rows: [ 80, 80 ] } ) }
					width={ 300 }
					height={ 160 }
				/>
			);

			expect( container.querySelectorAll( 'line' ) ).toHaveLength( 4 + 3 );
			expect( container.querySelectorAll( 'rect' ) ).toHaveLength( 0 );
		} );

		it( 'snaps line coordinates to half pixels for crisp 1px strokes', () => {
			const { container } = renderWithTheme(
				<GridOutline
					element={ null }
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

		it( 'passes the resolved iframe border color through to each line', () => {
			const { container } = renderWithTheme(
				<GridOutline
					element={ null }
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

		it( 'renders nothing when there are no tracks on either axis', () => {
			const { container } = renderWithTheme(
				<GridOutline element={ null } tracks={ makeTracks() } width={ 100 } height={ 100 } />
			);

			expect( container.querySelectorAll( 'line' ) ).toHaveLength( 0 );
			expect( container.querySelectorAll( 'rect' ) ).toHaveLength( 0 );
		} );
	} );

	describe( 'first-empty-cell indicator', () => {
		it( 'renders a + glyph in the first empty cell when one exists', () => {
			const element = document.createElement( 'div' );
			document.body.appendChild( element );

			const { container } = renderWithTheme(
				<GridOutline
					element={ element }
					tracks={ makeTracks( { columns: [ 100, 100, 100 ], rows: [ 80, 80 ] } ) }
					width={ 300 }
					height={ 160 }
				/>
			);

			const glyph = container.querySelector( 'g' );
			expect( glyph ).not.toBeNull();
			expect( glyph?.querySelectorAll( 'line' ) ).toHaveLength( 2 );
		} );

		it( 'does not render the + glyph when the grid is fully occupied', () => {
			const element = document.createElement( 'div' );

			for ( let i = 0; i < 6; i++ ) {
				const child = document.createElement( 'div' );
				child.classList.add( 'elementor-element' );
				element.appendChild( child );
			}

			document.body.appendChild( element );

			const { container } = renderWithTheme(
				<GridOutline
					element={ element }
					tracks={ makeTracks( { columns: [ 100, 100, 100 ], rows: [ 80, 80 ] } ) }
					width={ 300 }
					height={ 160 }
				/>
			);

			expect( container.querySelector( 'g' ) ).toBeNull();
		} );

		it( 'does not render the + glyph when no element is provided', () => {
			const { container } = renderWithTheme(
				<GridOutline
					element={ null }
					tracks={ makeTracks( { columns: [ 100 ], rows: [ 80 ] } ) }
					width={ 100 }
					height={ 80 }
				/>
			);

			expect( container.querySelector( 'g' ) ).toBeNull();
		} );
	} );

	describe( 'with a gap', () => {
		it( 'draws one rect per cell so each cell has its own framed perimeter', () => {
			const { container } = renderWithTheme(
				<GridOutline
					element={ null }
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

			expect( container.querySelectorAll( 'rect' ) ).toHaveLength( 3 * 2 );
			expect( container.querySelectorAll( 'line' ) ).toHaveLength( 0 );
		} );

		it( 'offsets cells past the gap', () => {
			const { container } = renderWithTheme(
				<GridOutline
					element={ null }
					tracks={ makeTracks( {
						columns: [ 100, 100, 100 ],
						rows: [ 80 ],
						columnGap: 10,
					} ) }
					width={ 320 }
					height={ 80 }
				/>
			);

			const xs = Array.from( container.querySelectorAll( 'rect' ) ).map( ( rect ) => rect.getAttribute( 'x' ) );
			expect( xs ).toEqual( [ '0.5', '110.5', '220.5' ] );
		} );

		it( 'passes the resolved iframe border color through to each cell', () => {
			const { container } = renderWithTheme(
				<GridOutline
					element={ null }
					tracks={ makeTracks( {
						columns: [ 100, 100 ],
						rows: [ 100 ],
						columnGap: 10,
						borderColor: '#abcdef',
					} ) }
					width={ 210 }
					height={ 100 }
				/>
			);

			const rects = container.querySelectorAll( 'rect' );
			expect( rects.length ).toBeGreaterThan( 0 );
			rects.forEach( ( rect ) => {
				expect( rect ).toHaveAttribute( 'stroke', '#abcdef' );
			} );
		} );
	} );
} );
