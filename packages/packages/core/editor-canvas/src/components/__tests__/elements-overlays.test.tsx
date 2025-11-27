import * as React from 'react';
import { createDOMElement, createMockElement, createMockElementType, renderWithTheme } from 'test-utils';
import { getElements, useSelectedElement } from '@elementor/editor-elements';
import {
	__privateUseIsRouteActive as useIsRouteActive,
	isExperimentActive,
	useEditMode,
} from '@elementor/editor-v1-adapters';
import { screen, waitFor } from '@testing-library/react';

import { hasInlineEditableProperty } from '../../utils/inline-editing-utils';
import { ElementsOverlays } from '../elements-overlays';
import { CANVAS_WRAPPER_ID } from '../outline-overlay';

jest.mock( '@elementor/editor-elements' );
jest.mock( '@elementor/editor-v1-adapters', () => ( {
	...jest.requireActual( '@elementor/editor-v1-adapters' ),
	useEditMode: jest.fn(),
	__privateUseIsRouteActive: jest.fn(),
	isExperimentActive: jest.fn(),
} ) );
jest.mock( '../../utils/inline-editing-utils' );

describe( '<ElementsOverlays />', () => {
	beforeEach( () => {
		const documentEl = createDOMElement( { tag: 'div' } );
		const containerEl = createDOMElement( { tag: 'div' } );
		const atomic1El = createDOMElement( { tag: 'div', attrs: { 'data-atomic': '', id: '10' } } );
		const atomic2El = createDOMElement( { tag: 'div', attrs: { 'data-atomic': '', id: '20' } } );

		jest.mocked( useEditMode ).mockReturnValue( 'edit' );
		jest.mocked( useIsRouteActive ).mockReturnValue( false );
		jest.mocked( hasInlineEditableProperty ).mockReturnValue( false );
		jest.mocked( isExperimentActive ).mockReturnValue( true );

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
		renderWithTheme( <ElementsOverlays /> );

		// Assert.
		await waitFor( () => {
			const overlay = screen.getByRole( 'presentation' );
			expect( overlay ).toHaveAttribute( 'data-element-overlay', 'atomic2' );
			// eslint-disable-next-line testing-library/no-test-id-queries
			expect( screen.getByTestId( CANVAS_WRAPPER_ID ) ).toContainElement( overlay );
		} );
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

	it( 'should return null when editor is not in edit mode', () => {
		// Arrange
		jest.mocked( useEditMode ).mockReturnValue( 'preview' );
		jest.mocked( useIsRouteActive ).mockReturnValue( false );
		jest.mocked( useSelectedElement ).mockReturnValue( {
			element: { id: 'atomic1', type: 'widget' },
			elementType: createMockElementType(),
		} );

		// Act
		const { container } = renderWithTheme( <ElementsOverlays /> );

		// Assert
		expect( container ).toBeEmptyDOMElement();
		expect( screen.queryByRole( 'presentation' ) ).not.toBeInTheDocument();
	} );

	it( 'should return null when panel/global route is active', () => {
		// Arrange
		jest.mocked( useEditMode ).mockReturnValue( 'edit' );
		jest.mocked( useIsRouteActive ).mockReturnValue( true );
		jest.mocked( useSelectedElement ).mockReturnValue( {
			element: { id: 'atomic1', type: 'widget' },
			elementType: createMockElementType(),
		} );

		// Act
		const { container } = renderWithTheme( <ElementsOverlays /> );

		// Assert
		expect( container ).toBeEmptyDOMElement();
		expect( screen.queryByRole( 'presentation' ) ).not.toBeInTheDocument();
	} );

	it( 'should render OutlineOverlay for atomic elements', async () => {
		// Arrange
		jest.mocked( useSelectedElement ).mockReturnValue( {
			element: { id: 'atomic1', type: 'widget' },
			elementType: createMockElementType(),
		} );

		// Act
		renderWithTheme( <ElementsOverlays /> );

		// Assert
		const overlay = await screen.findByRole( 'presentation' );
		expect( overlay ).toBeInTheDocument();
		expect( overlay ).toHaveAttribute( 'data-element-overlay', 'atomic1' );
	} );

	it( 'should render InlineEditorOverlay only for selected elements that support inline editing', async () => {
		// Arrange
		const headingEl = createDOMElement( { tag: 'div', attrs: { 'data-atomic': '', id: '50' } } );

		jest.mocked( getElements ).mockReturnValue( [
			createMockElement( {
				model: { id: 'heading-element' },
				view: { el: headingEl, getDomElement: () => ( { get: () => headingEl } ) },
			} ),
		] );

		jest.mocked( useSelectedElement ).mockReturnValue( {
			element: { id: 'heading-element', type: 'widget' },
			elementType: createMockElementType(),
		} );

		// Act
		renderWithTheme( <ElementsOverlays /> );

		// Assert
		await waitFor( () => {
			const overlay = screen.getByRole( 'presentation' );
			expect( overlay ).toHaveAttribute( 'data-element-overlay', 'heading-element' );
		} );
	} );
} );
