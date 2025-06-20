import * as React from 'react';
import { renderWithTheme } from 'test-utils';
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
		renderWithTheme( <Shell /> );

		// Assert.
		expect( screen.getByText( 'test' ) ).toBeInTheDocument();
	} );
} );
