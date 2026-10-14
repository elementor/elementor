import * as React from 'react';
import { renderWithQuery } from 'test-utils';
import { screen } from '@testing-library/react';

import { injectIntoTop } from '../../locations';
import Shell from '../shell';

describe( '<Shell />', () => {
	it( 'should render', () => {
		// Arrange.
		injectIntoTop( {
			id: 'test',
			component: () => <div>test</div>,
		} );

		// Act.
		renderWithQuery( <Shell /> );

		// Assert.
		expect( screen.getByText( 'test' ) ).toBeInTheDocument();
	} );
} );
