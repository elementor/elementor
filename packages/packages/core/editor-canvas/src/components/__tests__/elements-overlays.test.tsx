import * as React from 'react';
import { createDOMElement, createMockElement, createMockElementType, renderWithTheme } from 'test-utils';
import { getElements, useSelectedElement } from '@elementor/editor-elements';
import { __privateUseIsRouteActive as useIsRouteActive, useEditMode } from '@elementor/editor-v1-adapters';
import { act, screen } from '@testing-library/react';

import { CANVAS_WRAPPER_ID } from '../element-overlay';
import { ElementsOverlays } from '../elements-overlays';

jest.mock( '@elementor/editor-elements' );
jest.mock( '@elementor/editor-v1-adapters', () => ( {
	...jest.requireActual( '@elementor/editor-v1-adapters' ),
	useEditMode: jest.fn(),
	__privateUseIsRouteActive: jest.fn(),
} ) );

describe( '<ElementsOverlays />', () => {
	beforeEach( () => {
		const documentEl = createDOMElement( { tag: 'div' } );
		const containerEl = createDOMElement( { tag: 'div' } );
		const atomic1El = createDOMElement( { tag: 'div', attrs: { 'data-atomic': '', id: '10' } } );
		const atomic2El = createDOMElement( { tag: 'div', attrs: { 'data-atomic': '', id: '20' } } );

		jest.mocked( useEditMode ).mockReturnValue( 'edit' );
		jest.mocked( useIsRouteActive ).mockReturnValue( false );

		jest.mocked( getElements ).mockReturnValue( [
			createMockElement( {
				model: { id: 'document' },
				view: { el: documentEl, getDomElement: () => ( { get: () => documentEl } ) },
			} ),
			createMockElement( {
				model: { id: 'container' },
				view: { el: containerEl, getDomElement: () => ( { get: () => containerEl } ) },
			} ),
			createMockElement( {
				model: { id: 'atomic1' },
				view: { el: atomic1El, getDomElement: () => ( { get: () => atomic1El } ) },
			} ),
			createMockElement( {
				model: { id: 'atomic2' },
				view: { el: atomic2El, getDomElement: () => ( { get: () => atomic2El } ) },
			} ),
		] );

		jest.mocked( useSelectedElement ).mockReturnValue( { element: null, elementType: null } );

		window.document.body.appendChild(
			createDOMElement( {
				tag: 'div',
				attrs: {
					'data-testid': CANVAS_WRAPPER_ID,
					id: CANVAS_WRAPPER_ID,
				},
			} )
		);
	} );

	afterEach( () => {
		window.document.body.innerHTML = '';
	} );

	it( 'should render an overlay on atomic element when the element is selected', async () => {
		// Arrange.
		jest.mocked( useSelectedElement ).mockReturnValue( {
			element: { id: 'atomic2', type: 'widget' },
			elementType: createMockElementType(),
		} );

		// Act.
		// eslint-disable-next-line testing-library/no-unnecessary-act
		await act( () => renderWithTheme( <ElementsOverlays /> ) );

		// Assert.
		const overlay = screen.getByRole( 'presentation' );

		expect( overlay ).toHaveAttribute( 'data-element-overlay', 'atomic2' );

		// eslint-disable-next-line testing-library/no-test-id-queries
		expect( screen.getByTestId( CANVAS_WRAPPER_ID ) ).toContainElement( overlay );
	} );

	it.each( [
		{
			message: 'preview mode is active',
			payload: {
				isPreviewMode: true,
				isKitRouteActive: false,
				selected: { id: '20', type: 'widget' },
			},
		},
		{
			message: 'kit route is active',
			payload: {
				isPreviewMode: false,
				isKitRouteActive: true,
				selected: { id: '20', type: 'widget' },
			},
		},
		{
			message: 'nothing selected or hovered',
			payload: {
				isPreviewMode: false,
				isKitRouteActive: false,
				selected: null,
			},
		},
	] )( 'should not render overlays if $message', ( { payload } ) => {
		// Arrange.
		jest.mocked( useEditMode ).mockReturnValue( payload.isPreviewMode ? 'preview' : 'edit' );
		jest.mocked( useIsRouteActive ).mockReturnValue( payload.isKitRouteActive );

		jest.mocked( useSelectedElement ).mockReturnValue(
			payload.selected
				? {
						element: payload.selected,
						elementType: createMockElementType(),
				  }
				: {
						element: null,
						elementType: null,
				  }
		);

		// Act.
		renderWithTheme( <ElementsOverlays /> );

		// Assert.
		expect( screen.queryByRole( 'presentation' ) ).not.toBeInTheDocument();
	} );
} );
