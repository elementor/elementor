import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';
import { __ } from '@wordpress/i18n';

import { ComponentIntroduction } from '../../components-tab/component-introduction';

jest.mock( '@wordpress/i18n' );

describe( 'ComponentIntroduction', () => {
	const anchorRef = React.createRef< HTMLDivElement >();
	const mockOnClose = jest.fn();

	beforeEach( () => {
		jest.clearAllMocks();
		( __ as jest.Mock ).mockImplementation( ( str ) => str );

		// Create a mock anchor element
		const anchorElement = document.createElement( 'div' );
		document.body.appendChild( anchorElement );
		anchorRef.current = anchorElement;
	} );

	afterEach( () => {
		if ( anchorRef.current ) {
			document.body.removeChild( anchorRef.current );
		}
	} );

	it( 'should render the introduction popover when shouldShowIntroduction is true', () => {
		// Act
		renderWithTheme(
			<ComponentIntroduction anchorRef={ anchorRef } shouldShowIntroduction={ true } onClose={ mockOnClose } />
		);

		// Assert
		expect( screen.getByText( 'Add your first property' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Properties make instances flexible.' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Got it' ) ).toBeInTheDocument();
	} );

	it( 'should not render the introduction popover when shouldShowIntroduction is false', () => {
		// Act
		renderWithTheme(
			<ComponentIntroduction anchorRef={ anchorRef } shouldShowIntroduction={ false } onClose={ mockOnClose } />
		);

		// Assert
		expect( screen.queryByText( 'Add your first property' ) ).not.toBeInTheDocument();
	} );

	it( 'should call onClose when clicking the "Got it" button', () => {
		// Act
		renderWithTheme(
			<ComponentIntroduction anchorRef={ anchorRef } shouldShowIntroduction={ true } onClose={ mockOnClose } />
		);

		const gotItButton = screen.getByRole( 'button', { name: 'Got it' } );

		fireEvent.click( gotItButton );

		// Assert
		expect( mockOnClose ).toHaveBeenCalled();
	} );

	it( 'should call onClose when clicking the close button', () => {
		// Act
		renderWithTheme(
			<ComponentIntroduction anchorRef={ anchorRef } shouldShowIntroduction={ true } onClose={ mockOnClose } />
		);

		const closeButton = screen.getByRole( 'button', { name: 'close' } );

		fireEvent.click( closeButton );

		// Assert
		expect( mockOnClose ).toHaveBeenCalled();
	} );
} );
