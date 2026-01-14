import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { screen } from '@testing-library/react';

import { ComponentsProNotification } from '../components-pro-notification';

type ExtendedWindow = Window & {
	elementor?: {
		helpers?: {
			hasPro?: () => boolean;
		};
	};
	elementorPro?: {
		config?: {
			isActive?: boolean;
		};
	};
};

describe( 'ComponentsProNotification', () => {
	const extendedWindow = window as unknown as ExtendedWindow;
	let originalElementor: ExtendedWindow[ 'elementor' ];
	let originalElementorPro: ExtendedWindow[ 'elementorPro' ];

	beforeEach( () => {
		originalElementor = extendedWindow.elementor;
		originalElementorPro = extendedWindow.elementorPro;
	} );

	afterEach( () => {
		extendedWindow.elementor = originalElementor;
		extendedWindow.elementorPro = originalElementorPro;
	} );

	it( 'should render notification for Core users without Pro', () => {
		// Arrange
		extendedWindow.elementor = {
			helpers: {
				hasPro: () => false,
			},
		};
		extendedWindow.elementorPro = undefined;

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

	it( 'should not render notification for users with active Pro', () => {
		// Arrange
		extendedWindow.elementor = {
			helpers: {
				hasPro: () => true,
			},
		};
		extendedWindow.elementorPro = {
			config: {
				isActive: true,
			},
		};

		// Act
		renderWithTheme( <ComponentsProNotification /> );

		// Assert
		expect( screen.queryByText( /Try Components for free:/i ) ).not.toBeInTheDocument();
	} );
} );
