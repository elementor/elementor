import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { ComponentModal } from '../component-modal';
import { useCanvasDocument } from '../use-canvas-document';

jest.mock( '@elementor/editor-canvas' );
jest.mock( '@elementor/editor-v1-adapters' );
jest.mock( '../use-canvas-document' );

describe( '<ComponentModal />', () => {
	let mockOnClose: jest.Mock;

	beforeEach( () => {
		jest.mocked( useCanvasDocument ).mockReturnValue( document );

		mockOnClose = jest.fn();
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'ComponentModal', () => {
		it( 'should not render when portal is not available', () => {
			// Arrange.
			jest.mocked( useCanvasDocument ).mockReturnValue( null );
			renderWithTheme( <div aria-label="mock-widget"></div> );

			// Act.
			const mockElement = screen.getByLabelText( 'mock-widget' );
			renderWithTheme( <ComponentModal topLevelElementDom={ mockElement } onClose={ mockOnClose } /> );

			// Assert.
			expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();
		} );

		it( 'should trigger the onClose when clicking on the backdrop', () => {
			// Arrange.
			renderWithTheme( <div aria-label="mock-widget"></div> );
			const mockElement = screen.getByLabelText( 'mock-widget' );

			// Act.
			renderWithTheme( <ComponentModal topLevelElementDom={ mockElement } onClose={ mockOnClose } /> );

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
			renderWithTheme( <ComponentModal topLevelElementDom={ mockElement } onClose={ mockOnClose } /> );

			fireEvent.keyDown( mockElement.ownerDocument.body, { key: 'Escape' } );

			// Assert.
			expect( mockOnClose ).toHaveBeenCalledTimes( 1 );
		} );
	} );
} );
