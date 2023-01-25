import { render } from '@testing-library/react';
import Shell from '../shell';
import { injectIntoTop } from '../../locations';

describe( '@elementor/editor Shell component', () => {
	it( 'should render', () => {
		injectIntoTop( {
			name: 'test',
			filler: () => <div>test</div>,
		} );

		const { queryByText } = render( <Shell /> );

		expect( queryByText( 'test' ) ).toBeTruthy();
	} );
} );
