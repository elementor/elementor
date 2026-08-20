import { findFirstEmptyCell } from '../find-first-empty-cell';

type ChildSpec = {
	gridColumnStart?: string;
	gridColumnEnd?: string;
	gridRowStart?: string;
	gridRowEnd?: string;
	display?: string;
};

function makeGrid( {
	autoFlow = 'row',
	children = [],
}: { autoFlow?: string; children?: ChildSpec[] } = {} ): HTMLElement {
	const element = document.createElement( 'div' );
	element.style.gridAutoFlow = autoFlow;

	for ( const spec of children ) {
		const child = document.createElement( 'div' );
		child.classList.add( 'elementor-element' );

		if ( spec.gridColumnStart ) {
			child.style.gridColumnStart = spec.gridColumnStart;
		}
		if ( spec.gridColumnEnd ) {
			child.style.gridColumnEnd = spec.gridColumnEnd;
		}
		if ( spec.gridRowStart ) {
			child.style.gridRowStart = spec.gridRowStart;
		}
		if ( spec.gridRowEnd ) {
			child.style.gridRowEnd = spec.gridRowEnd;
		}
		if ( spec.display ) {
			child.style.display = spec.display;
		}

		element.appendChild( child );
	}

	document.body.appendChild( element );
	return element;
}

describe( 'findFirstEmptyCell', () => {
	it( 'returns null when the element is null', () => {
		expect( findFirstEmptyCell( null, 3, 3 ) ).toBeNull();
	} );

	it( 'returns null when either axis has zero tracks', () => {
		const element = makeGrid();
		expect( findFirstEmptyCell( element, 0, 3 ) ).toBeNull();
		expect( findFirstEmptyCell( element, 3, 0 ) ).toBeNull();
	} );

	it( 'returns the first cell when the grid is empty', () => {
		const element = makeGrid();
		expect( findFirstEmptyCell( element, 3, 2 ) ).toEqual( { row: 0, col: 0 } );
	} );

	it( 'walks row-major when grid-auto-flow is row', () => {
		const element = makeGrid( {
			autoFlow: 'row',
			children: [ {}, {} ],
		} );
		expect( findFirstEmptyCell( element, 3, 2 ) ).toEqual( { row: 0, col: 2 } );
	} );

	it( 'walks column-major when grid-auto-flow is column', () => {
		const element = makeGrid( {
			autoFlow: 'column',
			children: [ {}, {} ],
		} );
		expect( findFirstEmptyCell( element, 3, 2 ) ).toEqual( { row: 0, col: 1 } );
	} );

	it( 'honors explicit grid-column-start / grid-row-start', () => {
		const element = makeGrid( {
			children: [ { gridColumnStart: '3', gridRowStart: '1' } ],
		} );
		expect( findFirstEmptyCell( element, 3, 2 ) ).toEqual( { row: 0, col: 0 } );
	} );

	it( 'skips cells covered by an explicit span', () => {
		const element = makeGrid( {
			children: [ { gridColumnStart: '1', gridColumnEnd: 'span 2' } ],
		} );
		expect( findFirstEmptyCell( element, 3, 2 ) ).toEqual( { row: 0, col: 2 } );
	} );

	it( 'skips rows covered by a row span', () => {
		const element = makeGrid( {
			children: [ { gridRowStart: '1', gridRowEnd: 'span 2' } ],
		} );
		expect( findFirstEmptyCell( element, 2, 2 ) ).toEqual( { row: 0, col: 1 } );
	} );

	it( 'auto-places remaining children around explicit placements', () => {
		const element = makeGrid( {
			children: [ { gridColumnStart: '2', gridRowStart: '1' }, {} ],
		} );
		expect( findFirstEmptyCell( element, 3, 2 ) ).toEqual( { row: 0, col: 2 } );
	} );

	it( 'returns null when the grid is fully occupied', () => {
		const element = makeGrid( {
			children: [ {}, {}, {}, {}, {}, {} ],
		} );
		expect( findFirstEmptyCell( element, 3, 2 ) ).toBeNull();
	} );

	it( 'ignores children with display: none', () => {
		const element = makeGrid( {
			children: [ { display: 'none' } ],
		} );
		expect( findFirstEmptyCell( element, 2, 1 ) ).toEqual( { row: 0, col: 0 } );
	} );

	it( 'ignores scaffolding children that are not .elementor-element', () => {
		const element = makeGrid( { children: [ {} ] } );

		const overlay = document.createElement( 'div' );
		overlay.classList.add( 'elementor-element-overlay' );
		element.insertBefore( overlay, element.firstChild );

		const emptyView = document.createElement( 'div' );
		emptyView.classList.add( 'elementor-empty-view' );
		element.appendChild( emptyView );

		expect( findFirstEmptyCell( element, 3, 1 ) ).toEqual( { row: 0, col: 1 } );
	} );
} );
