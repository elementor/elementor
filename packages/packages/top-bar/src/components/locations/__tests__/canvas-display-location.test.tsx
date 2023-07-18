import { render } from '@testing-library/react';
import { injectIntoCanvasDisplay } from '../../../locations';
import CanvasDisplayLocation from '../canvas-display-location';

describe( '@elementor/top-bar - Canvas display location', () => {
	it( 'should inject into canvas display', () => {
		// Act.
		injectIntoCanvasDisplay( {
			name: 'test',
			filler: () => <span>test</span>,
		} );

		// Assert.
		const { queryByText } = render( <CanvasDisplayLocation /> );

		expect( queryByText( 'test' ) ).toBeTruthy();
	} );
} );
