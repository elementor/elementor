import { render } from '@testing-library/react';
import Shell from '../shell';
import { injectIntoTop } from '../../locations';

describe( '@elementor/editor Shell component', () => {
	it( 'should render', () => {
		// Arrange.
		injectIntoTop( {
			name: 'test',
			filler: () => <div>test</div>,
		} );

		// Act.
		const { queryByText } = render( <Shell /> );

		// Assert.
		expect( queryByText( 'test' ) ).toBeTruthy();
	} );
} );
