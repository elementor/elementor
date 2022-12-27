import { render } from '@testing-library/react';
import TopBar from '../top-bar';

describe( '@elementor/top-bar TopBar component', () => {
	it( 'should render elementor logo', () => {
		const { queryAllByRole } = render( <TopBar /> );

		const buttons = queryAllByRole( 'button' );

		expect( buttons.length ).toBe( 2 );
	} );
} );
