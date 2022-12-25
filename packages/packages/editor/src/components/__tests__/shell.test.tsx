import { render } from '@testing-library/react';
import Shell from '../shell';
import { addFill } from '@elementor/locations';
import { EDITOR_TOP_LOCATION } from '../../locations';

describe( '@elementor/editor Shell component', () => {
	it( 'should render', () => {
		addFill( {
			location: EDITOR_TOP_LOCATION,
			component: () => <div>test</div>,
		} );

		const { queryByText } = render( <Shell /> );

		expect( queryByText( 'test' ) ).toBeTruthy();
	} );
} );
