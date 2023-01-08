import { render } from '@testing-library/react';
import TopBar from '../top-bar';

describe( '@elementor/top-bar TopBar component', () => {
	it( 'should render elementor logo', () => {
		const { queryByText } = render( <TopBar /> );

		const logoTitle = queryByText( 'Elementor Logo' );

		expect( logoTitle ).toBeTruthy();
	} );
} );
