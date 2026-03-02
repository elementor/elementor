import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { AngieIntroModal } from '../angie-intro-modal';

describe( 'AngieIntroModal', () => {
	const onClose = jest.fn();
	const onConfirm = jest.fn();

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should render the modal with correct content', () => {
		// Act
		renderWithTheme( <AngieIntroModal onClose={ onClose } onConfirm={ onConfirm } /> );

		// Assert
		expect( screen.getByText( 'Meet Angie' ) ).toBeInTheDocument();
		expect( screen.getByText( 'New' ) ).toBeInTheDocument();
		expect( screen.getByText( 'You can now generate custom components using Angie' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: "Let's Try" } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Close' } ) ).toBeInTheDocument();
	} );

	it( 'should call onConfirm when clicking confirm button', () => {
		// Act
		renderWithTheme( <AngieIntroModal onClose={ onClose } onConfirm={ onConfirm } /> );
		fireEvent.click( screen.getByRole( 'button', { name: "Let's Try" } ) );

		// Assert
		expect( onConfirm ).toHaveBeenCalled();
		expect( onClose ).not.toHaveBeenCalled();
	} );

	it( 'should call onClose when clicking the close button', () => {
		// Act
		renderWithTheme( <AngieIntroModal onClose={ onClose } onConfirm={ onConfirm } /> );
		fireEvent.click( screen.getByRole( 'button', { name: 'Close' } ) );

		// Assert
		expect( onClose ).toHaveBeenCalled();
		expect( onConfirm ).not.toHaveBeenCalled();
	} );

	it( 'should call onClose when pressing Escape', () => {
		// Act
		renderWithTheme( <AngieIntroModal onClose={ onClose } onConfirm={ onConfirm } /> );
		fireEvent.keyDown( screen.getByRole( 'dialog' ), { key: 'Escape' } );

		// Assert
		expect( onClose ).toHaveBeenCalled();
	} );
} );
