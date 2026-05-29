import * as React from 'react';
import { createDOMElement, renderWithTheme } from 'test-utils';
import { useSelectedElementSettings } from '@elementor/editor-elements';
import { screen } from '@testing-library/react';

import { useElementRect } from '../../../hooks/use-element-rect';
import { useFloatingOnElement } from '../../../hooks/use-floating-on-element';
import { type GridTracks, useGridTracks } from '../../../hooks/use-grid-tracks';
import { CANVAS_WRAPPER_ID } from '../../outline-overlay';
import { GridOutlineOverlay } from '../grid-outline-overlay';

jest.mock( '@elementor/editor-elements' );
jest.mock( '../../../hooks/use-element-rect' );
jest.mock( '../../../hooks/use-grid-tracks' );
jest.mock( '../../../hooks/use-floating-on-element' );

const ID = 'grid-1';

const NON_EMPTY_TRACKS: GridTracks = {
	columns: [ 100, 100 ],
	rows: [ 80, 80, 80 ],
	columnGap: 0,
	rowGap: 0,
	padding: { top: 10, right: 10, bottom: 10, left: 10 },
	borderColor: '#D5D8DC',
};

const EMPTY_TRACKS: GridTracks = {
	columns: [],
	rows: [],
	columnGap: 0,
	rowGap: 0,
	padding: { top: 0, right: 0, bottom: 0, left: 0 },
	borderColor: '',
};

function mockGridOutlineSetting( value: { $$type: 'boolean'; value: boolean } | null ) {
	jest.mocked( useSelectedElementSettings ).mockReturnValue( {
		element: { id: ID, type: 'e-grid' },
		elementType: {} as never,
		settings: { grid_outline: value },
	} );
}

function mockFloating() {
	jest.mocked( useFloatingOnElement ).mockReturnValue( {
		isVisible: true,
		context: {} as never,
		floating: {
			setRef: jest.fn(),
			ref: { current: null } as never,
			styles: { position: 'absolute', top: 0, left: 0 },
		},
	} );
}

function renderOverlay( props: Partial< { id: string; isSelected: boolean; isGlobal: boolean } > = {} ) {
	const element = createDOMElement( { tag: 'div', attrs: { 'data-e-type': 'e-grid' } } );

	return renderWithTheme(
		<GridOutlineOverlay
			id={ props.id ?? ID }
			element={ element }
			isSelected={ props.isSelected ?? true }
			isGlobal={ props.isGlobal ?? false }
		/>
	);
}

describe( '<GridOutlineOverlay />', () => {
	beforeEach( () => {
		jest.mocked( useElementRect ).mockReturnValue( new DOMRect( 0, 0, 220, 260 ) );
		jest.mocked( useGridTracks ).mockReturnValue( NON_EMPTY_TRACKS );
		mockFloating();

		window.document.body.appendChild(
			createDOMElement( {
				tag: 'div',
				attrs: { id: CANVAS_WRAPPER_ID, 'data-testid': CANVAS_WRAPPER_ID },
			} )
		);
	} );

	afterEach( () => {
		window.document.body.innerHTML = '';
		jest.clearAllMocks();
	} );

	it( 'renders the outline svg with the element id when the setting is enabled', () => {
		mockGridOutlineSetting( { $$type: 'boolean', value: true } );

		renderOverlay();

		const overlay = screen.getByRole( 'presentation' );
		expect( overlay ).toHaveAttribute( 'data-grid-outline', ID );
		// eslint-disable-next-line testing-library/no-node-access
		expect( overlay.querySelector( 'svg' ) ).toBeInTheDocument();
	} );

	it( 'treats a null setting as default-on and renders the outline', () => {
		mockGridOutlineSetting( null );

		renderOverlay();

		expect( screen.getByRole( 'presentation' ) ).toBeInTheDocument();
	} );

	it( 'renders nothing when the setting is explicitly disabled', () => {
		mockGridOutlineSetting( { $$type: 'boolean', value: false } );

		renderOverlay();

		expect( screen.queryByRole( 'presentation' ) ).not.toBeInTheDocument();
	} );

	it( 'renders nothing while tracks have not resolved yet', () => {
		mockGridOutlineSetting( { $$type: 'boolean', value: true } );
		jest.mocked( useGridTracks ).mockReturnValue( EMPTY_TRACKS );

		renderOverlay();

		expect( screen.queryByRole( 'presentation' ) ).not.toBeInTheDocument();
	} );

	it( 'renders one <rect> per grid cell', () => {
		mockGridOutlineSetting( null );
		jest.mocked( useGridTracks ).mockReturnValue( {
			...NON_EMPTY_TRACKS,
			columns: [ 100, 100, 100 ],
			rows: [ 80, 80 ],
			columnGap: 10,
			rowGap: 10,
		} );

		renderOverlay();

		const overlay = screen.getByRole( 'presentation' );
		// eslint-disable-next-line testing-library/no-node-access
		expect( overlay.querySelectorAll( 'rect' ) ).toHaveLength( 3 * 2 );
	} );

	it( 'mounts inside the canvas wrapper portal', () => {
		mockGridOutlineSetting( null );

		renderOverlay();

		// eslint-disable-next-line testing-library/no-test-id-queries
		const wrapper = screen.getByTestId( CANVAS_WRAPPER_ID );
		expect( wrapper ).toContainElement( screen.getByRole( 'presentation' ) );
	} );
} );
