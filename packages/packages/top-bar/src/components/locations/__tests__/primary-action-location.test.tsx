import { render } from '@testing-library/react';
import { injectIntoPrimaryAction } from '../../../locations';
import PrimaryActionLocation from '../primary-action-location';

describe( '@elementor/top-bar - Primary action location', () => {
	it( 'should inject into primary action', () => {
		// Act.
		injectIntoPrimaryAction( {
			name: 'test',
			filler: () => <span>test</span>,
		} );

		// Assert.
		const { queryByText } = render( <PrimaryActionLocation /> );

		expect( queryByText( 'test' ) ).toBeTruthy();
	} );
} );
