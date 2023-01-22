import { render } from '@testing-library/react';
import Shell from '../shell';
import { injectIntoTopLocation } from '../../locations';

describe( '@elementor/editor Shell component', () => {
	it( 'should render', () => {
		injectIntoTopLocation( () => <div>test</div> );

		const { queryByText } = render( <Shell /> );

		expect( queryByText( 'test' ) ).toBeTruthy();
	} );
} );
