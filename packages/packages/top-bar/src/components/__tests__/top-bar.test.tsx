import { render } from '@testing-library/react';
import TopBar from '../top-bar';

describe( '@elementor/top-bar TopBar component', () => {
	it( 'should render elementor logo', () => {
		const { queryByAltText } = render( <TopBar /> );

		expect( queryByAltText( 'Elementor Logo' ) ).toBeTruthy();
	} );
} );
