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
		expect( screen.getByText( "Don't show this again" ) ).toBeInTheDocument();
	} );

	it( 'should call onConfirm with false when clicking confirm without checking the checkbox', () => {
		// Act
		renderWithTheme( <AngieIntroModal onClose={ onClose } onConfirm={ onConfirm } /> );
		fireEvent.click( screen.getByRole( 'button', { name: "Let's Try" } ) );

		// Assert
		expect( onConfirm ).toHaveBeenCalledWith( false );
		expect( onClose ).not.toHaveBeenCalled();
	} );

	it( 'should call onConfirm with true when clicking confirm after checking the checkbox', () => {
		// Act
		renderWithTheme( <AngieIntroModal onClose={ onClose } onConfirm={ onConfirm } /> );
		fireEvent.click( screen.getByRole( 'checkbox' ) );
		fireEvent.click( screen.getByRole( 'button', { name: "Let's Try" } ) );

		// Assert
		expect( onConfirm ).toHaveBeenCalledWith( true );
	} );

	it( 'should call onClose when closing the modal', () => {
		// Act
		renderWithTheme( <AngieIntroModal onClose={ onClose } onConfirm={ onConfirm } /> );
		fireEvent.keyDown( screen.getByRole( 'dialog' ), { key: 'Escape' } );

		// Assert
		expect( onClose ).toHaveBeenCalled();
	} );
} );
