import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { screen } from '@testing-library/react';

import StatusSection from '../status-section';

describe( 'StatusSection', () => {
	it( 'renders its children even when count is 0', () => {
		// Arrange & Act.
		renderWithTheme(
			<StatusSection label="Failed audits" count={ 0 }>
				<div>Scan for cookies</div>
			</StatusSection>
		);

		// Assert.
		expect( screen.getByText( 'Failed audits (0)' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Scan for cookies' ) ).toBeInTheDocument();
	} );

	it( 'renders nothing when there are no children', () => {
		// Arrange & Act.
		renderWithTheme(
			<StatusSection label="Failed audits" count={ 0 }>
				{ null }
			</StatusSection>
		);

		// Assert.
		expect( screen.queryByText( 'Failed audits (0)' ) ).not.toBeInTheDocument();
	} );
} );
