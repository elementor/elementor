import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { useSuppressedMessage } from '@elementor/editor-current-user';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { __ } from '@wordpress/i18n';

import { ClassManagerIntroduction } from '../class-manager-introduction';

jest.mock( '@elementor/editor-current-user' );
jest.mock( '@wordpress/i18n' );

describe( 'ClassManagerIntroduction', () => {
	beforeEach( () => {
		jest.mocked( useSuppressedMessage ).mockReturnValue( [ false, jest.fn() ] );
		( __ as jest.Mock ).mockImplementation( ( str ) => str );
	} );

	it( 'should render the introduction modal when message is not suppressed', () => {
		// Act.
		renderWithTheme( <ClassManagerIntroduction /> );

		// Assert.
		expect( screen.getByText( 'Class Manager' ) ).toBeInTheDocument();
	} );

	it( 'should not render the introduction modal when message is suppressed', () => {
		// Arrange.
		jest.mocked( useSuppressedMessage ).mockReturnValue( [ true, jest.fn() ] );

		// Act.
		renderWithTheme( <ClassManagerIntroduction /> );

		// Assert.
		expect( screen.queryByText( 'Class Manager' ) ).not.toBeInTheDocument();
	} );

	it( 'should suppress the message and close the modal when handleClose is called with false', async () => {
		// Arrange.
		const suppressMessage = jest.fn();

		jest.mocked( useSuppressedMessage ).mockReturnValue( [ false, suppressMessage ] );

		// Act.
		renderWithTheme( <ClassManagerIntroduction /> );

		const checkbox = screen.getByRole( 'checkbox' );

		fireEvent.click( checkbox );

		const closeButton = screen.getByRole( 'button' );

		fireEvent.click( closeButton );

		// Assert
		expect( suppressMessage ).toHaveBeenCalled();

		await waitFor( () => {
			expect( screen.queryByText( 'Class Manager' ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'should close the modal without suppressing the message when handleClose is called with true', async () => {
		// Arrange.
		const suppressMessage = jest.fn();

		jest.mocked( useSuppressedMessage ).mockReturnValue( [ false, suppressMessage ] );

		// Act.
		renderWithTheme( <ClassManagerIntroduction /> );

		const closeButton = screen.getByRole( 'button' );

		fireEvent.click( closeButton );

		// Assert
		expect( suppressMessage ).not.toHaveBeenCalled();

		await waitFor( () => {
			expect( screen.queryByText( 'Class Manager' ) ).not.toBeInTheDocument();
		} );
	} );
} );
