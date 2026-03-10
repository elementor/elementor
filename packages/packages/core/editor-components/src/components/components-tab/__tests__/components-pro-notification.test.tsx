import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { screen } from '@testing-library/react';

import { ComponentsProNotification } from '../components-pro-notification';

describe( 'ComponentsProNotification', () => {
	it( 'should render upgrade notification with title and description', () => {
		// Act
		renderWithTheme( <ComponentsProNotification /> );

		// Assert
		expect( screen.getByText( 'Create New Components' ) ).toBeInTheDocument();
		expect( screen.getByText( /Your Pro subscription has expired\./i ) ).toBeInTheDocument();
		expect( screen.getByText( /Reactivate to enable components again\./i ) ).toBeInTheDocument();
	} );

	it( 'should render Upgrade Now button with link', () => {
		// Act
		renderWithTheme( <ComponentsProNotification /> );

		// Assert
		const upgradeLink = screen.getByRole( 'link', { name: /Upgrade Now/i } );
		expect( upgradeLink ).toBeInTheDocument();
		expect( upgradeLink ).toHaveAttribute( 'href', 'https://go.elementor.com/go-pro-components-create/' );
	} );
} );
