import { render } from '@testing-library/react';
import Shell from '../shell';
import { addFiller } from '@elementor/locations';
import locations from '../../locations';

describe( '@elementor/editor Shell component', () => {
	it( 'should render', () => {
		addFiller( {
			location: locations.TOP,
			component: () => <div>test</div>,
		} );

		const { queryByText } = render( <Shell /> );

		expect( queryByText( 'test' ) ).toBeTruthy();
	} );
} );
