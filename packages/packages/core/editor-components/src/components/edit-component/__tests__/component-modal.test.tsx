import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { usePortal } from '../../../hooks/use-portal';
import { ComponentModal } from '../component-modal';

jest.mock( '@elementor/editor-canvas' );
jest.mock( '@elementor/editor-v1-adapters' );
jest.mock( '../../../hooks/use-portal' );

const MOCK_VIEWPORT_WIDTH = 1024;
const MOCK_VIEWPORT_HEIGHT = 768;
const MOCK_ELEMENT_X = 100;
const MOCK_ELEMENT_Y = 200;
const MOCK_ELEMENT_WIDTH = 300;
const MOCK_ELEMENT_HEIGHT = 150;
const BORDER_RADIUS = 15;

describe( '<ComponentModal />', () => {
	let mockOnClose: jest.Mock;

	beforeEach( () => {
		jest.mocked( usePortal ).mockReturnValue( document );

		mockOnClose = jest.fn();
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'ComponentModal', () => {
		it( 'should not render when portal is not available', () => {
			// Arrange.
			jest.mocked( usePortal ).mockReturnValue( null );
			renderWithTheme( <div aria-label="mock-widget"></div> );

			// Act.
			const mockElement = screen.getByLabelText( 'mock-widget' );
			renderWithTheme( <ComponentModal element={ mockElement } onClose={ mockOnClose } /> );

			// Assert.
			expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();
		} );

		it( 'should render backdrop in certain styling', async () => {
			// Arrange.
			renderWithTheme( <div aria-label="mock-widget"></div> );
			const mockElement = screen.getByLabelText( 'mock-widget' );

			jest.spyOn( mockElement, 'getBoundingClientRect' ).mockReturnValue( {
				x: MOCK_ELEMENT_X,
				y: MOCK_ELEMENT_Y,
				width: MOCK_ELEMENT_WIDTH,
				height: MOCK_ELEMENT_HEIGHT,
				top: MOCK_ELEMENT_Y,
				left: MOCK_ELEMENT_X,
				right: MOCK_ELEMENT_X + MOCK_ELEMENT_WIDTH,
				bottom: MOCK_ELEMENT_Y + MOCK_ELEMENT_HEIGHT,
				toJSON: () => ( {} ),
			} as DOMRect );

			// Act.
			renderWithTheme( <ComponentModal element={ mockElement } onClose={ mockOnClose } /> );

			// Assert.
			const backdrop = screen.getByRole( 'button', { name: 'Exit component editing mode' } );
			expect( backdrop ).toBeInTheDocument();
			expect( backdrop ).toBeVisible();
			expect( backdrop ).toHaveStyle( {
				position: 'fixed',
				top: 0,
				left: 0,
				width: '100vw',
				height: '100vh',
				backgroundColor: 'rgba(0, 0, 0, 0.5)',
				zIndex: 999,
				cursor: 'pointer',
				pointerEvents: 'painted',
			} );

			const clipPath = backdrop.style.clipPath;
			expect( clipPath ).toEqual(
				`path(evenodd, 'M 0 0 
					L ${ MOCK_VIEWPORT_WIDTH } 0
					L ${ MOCK_VIEWPORT_WIDTH } ${ MOCK_VIEWPORT_HEIGHT }
					L 0 ${ MOCK_VIEWPORT_HEIGHT }
					Z
					M ${ MOCK_ELEMENT_X + BORDER_RADIUS } ${ MOCK_ELEMENT_Y }
					L ${ MOCK_ELEMENT_X + MOCK_ELEMENT_WIDTH - BORDER_RADIUS } ${ MOCK_ELEMENT_Y }
					A ${ BORDER_RADIUS } ${ BORDER_RADIUS } 0 0 1 ${ MOCK_ELEMENT_X + MOCK_ELEMENT_WIDTH } ${
						MOCK_ELEMENT_Y + BORDER_RADIUS
					}
					L ${ MOCK_ELEMENT_X + MOCK_ELEMENT_WIDTH } ${ MOCK_ELEMENT_Y + MOCK_ELEMENT_HEIGHT - BORDER_RADIUS }
					A ${ BORDER_RADIUS } ${ BORDER_RADIUS } 0 0 1 ${ MOCK_ELEMENT_X + MOCK_ELEMENT_WIDTH - BORDER_RADIUS } ${
						MOCK_ELEMENT_Y + MOCK_ELEMENT_HEIGHT
					}
					L ${ MOCK_ELEMENT_X + BORDER_RADIUS } ${ MOCK_ELEMENT_Y + MOCK_ELEMENT_HEIGHT }
					A ${ BORDER_RADIUS } ${ BORDER_RADIUS } 0 0 1 ${ MOCK_ELEMENT_X } ${
						MOCK_ELEMENT_Y + MOCK_ELEMENT_HEIGHT - BORDER_RADIUS
					}
					L ${ MOCK_ELEMENT_X } ${ MOCK_ELEMENT_Y + BORDER_RADIUS }
					A ${ BORDER_RADIUS } ${ BORDER_RADIUS } 0 0 1 ${ MOCK_ELEMENT_X + BORDER_RADIUS } ${ MOCK_ELEMENT_Y }
					Z'
				)`.replace( /\s{2,}/g, ' ' )
			);
		} );

		it( 'should trigger the onClose when clicking on the backdrop', () => {
			// Arrange.
			renderWithTheme( <div aria-label="mock-widget"></div> );
			const mockElement = screen.getByLabelText( 'mock-widget' );

			// Act.
			renderWithTheme( <ComponentModal element={ mockElement } onClose={ mockOnClose } /> );

			const backdrop = screen.getByRole( 'button' );
			fireEvent.click( backdrop );

			// Assert.
			expect( mockOnClose ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should trigger the onClose when pressing the Esc key', () => {
			// Arrange.
			renderWithTheme( <div aria-label="mock-widget"></div> );
			const mockElement = screen.getByLabelText( 'mock-widget' );

			// Act.
			renderWithTheme( <ComponentModal element={ mockElement } onClose={ mockOnClose } /> );

			fireEvent.keyDown( mockElement.ownerDocument.body, { key: 'Escape' } );

			// Assert.
			expect( mockOnClose ).toHaveBeenCalledTimes( 1 );
		} );
	} );
} );
