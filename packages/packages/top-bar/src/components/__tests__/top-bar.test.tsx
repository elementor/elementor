import { render } from '@testing-library/react';
import TopBar from '../top-bar';

describe( '@elementor/top-bar TopBar component', () => {
	it( 'should render elementor logo', () => {
		// Act.
		const { queryByText } = render( <TopBar /> );

		// Assert.
		const logoTitle = queryByText( 'Elementor Logo' );

		expect( logoTitle ).toBeTruthy();
	} );
} );
