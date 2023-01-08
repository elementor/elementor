import { render } from '@testing-library/react';
import Shell from '../shell';
import { addToTop } from '../../locations';

describe( '@elementor/editor Shell component', () => {
	it( 'should render', () => {
		addToTop( {
			component: () => <div>test</div>,
		} );

		const { queryByText } = render( <Shell /> );

		expect( queryByText( 'test' ) ).toBeTruthy();
	} );
} );
