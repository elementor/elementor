import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { screen } from '@testing-library/react';

import FloatingPanelFooter from '../floating-panel-footer';

describe( 'FloatingPanelFooter', () => {
	it( 'renders footer children', () => {
		// Act.
		renderWithTheme( <FloatingPanelFooter>Footer actions</FloatingPanelFooter> );

		// Assert.
		expect( screen.getByText( 'Footer actions' ) ).toBeInTheDocument();
	} );
} );
