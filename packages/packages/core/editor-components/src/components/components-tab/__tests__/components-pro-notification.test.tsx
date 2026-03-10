import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { screen } from '@testing-library/react';

import { ComponentsProNotification } from '../components-pro-notification';

describe( 'ComponentsProNotification', () => {
	it( 'should render upgrade notification with title and description', () => {
		// Act
		renderWithTheme( <ComponentsProNotification /> );

		// Assert
		expect( screen.getByText( 'Create new components' ) ).toBeInTheDocument();
		expect(
			screen.getByText( /Creating new components requires an active Pro subscription\./i )
		).toBeInTheDocument();
	} );

	it( 'should render Upgrade now button with link', () => {
		// Act
		renderWithTheme( <ComponentsProNotification /> );

		// Assert
		const upgradeLink = screen.getByRole( 'link', { name: /Upgrade now/i } );
		expect( upgradeLink ).toBeInTheDocument();
		expect( upgradeLink ).toHaveAttribute( 'href', 'https://go.elementor.com/go-pro-components-create/' );
	} );
} );
