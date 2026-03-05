import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { screen } from '@testing-library/react';

import { ComponentsProNotification } from '../components-pro-notification';

describe( 'ComponentsProNotification', () => {
	it( 'should render notification content', () => {
		// Act
		renderWithTheme( <ComponentsProNotification /> );

		// Assert
		expect( screen.getByText( /Try Components for free:/i ) ).toBeInTheDocument();
		expect(
			screen.getByText(
				/Soon Components will be part of the Pro subscription, but what you create now will remain on your site\./i
			)
		).toBeInTheDocument();
	} );
} );
