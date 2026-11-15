import * as React from 'react';
import { render, screen } from '@testing-library/react';

import { SIDEBAR_CLASS } from '../../constants';
import { injectIntoSidebarFooter, injectIntoSidebarTools } from '../../locations';
import Sidebar from '../sidebar';

describe( 'Sidebar', () => {
	it( 'should render injected tools and footer items', () => {
		// Arrange.
		injectIntoSidebarTools( { id: 'tool', component: () => <div>Tool item</div> } );
		injectIntoSidebarFooter( { id: 'footer', component: () => <div>Footer item</div> } );

		// Act.
		render( <Sidebar /> );

		// Assert.
		expect( screen.getByText( 'Tool item' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Footer item' ) ).toBeInTheDocument();
	} );

	it( 'should render the sidebar element with the sidebar class', () => {
		// Act.
		render( <Sidebar /> );

		// Assert.
		expect( screen.getByRole( 'complementary', { name: 'Editor sidebar' } ) ).toHaveClass( SIDEBAR_CLASS );
	} );
} );
