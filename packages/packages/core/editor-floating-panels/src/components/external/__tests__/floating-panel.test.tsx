import * as React from 'react';
import { render, screen } from '@testing-library/react';

import FloatingPanel from '../floating-panel';

describe( 'FloatingPanel', () => {
	it( 'renders its children', () => {
		// Act.
		render(
			<FloatingPanel>
				<div>Panel content</div>
			</FloatingPanel>
		);

		// Assert.
		expect( screen.getByText( 'Panel content' ) ).toBeInTheDocument();
	} );
} );
