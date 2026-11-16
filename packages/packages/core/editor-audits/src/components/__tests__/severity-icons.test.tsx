import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { BulbIcon } from '@elementor/icons';

import SeverityIcon from '../severity-icons';

function getPathData( container: HTMLElement ): string | null {
	return container.querySelector( 'svg path' )?.getAttribute( 'd' ) ?? null;
}

describe( 'SeverityIcon', () => {
	it( 'renders the bulb icon for the info severity', () => {
		// Arrange.
		const { container: expectedContainer } = renderWithTheme( <BulbIcon /> );
		const expectedPath = getPathData( expectedContainer );

		// Act.
		const { container } = renderWithTheme( <SeverityIcon severity="info" /> );

		// Assert.
		expect( expectedPath ).not.toBeNull();
		expect( getPathData( container ) ).toBe( expectedPath );
	} );
} );
