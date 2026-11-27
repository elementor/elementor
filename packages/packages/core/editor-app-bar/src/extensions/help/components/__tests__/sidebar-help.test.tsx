import * as React from 'react';
import { useIsSidebarRailLocked } from '@elementor/editor-sidebar';
import { fireEvent, render, screen } from '@testing-library/react';

import SidebarHelp from '../sidebar-help';

jest.mock( '@elementor/editor-sidebar', () => ( {
	useIsSidebarRailLocked: jest.fn(),
} ) );

jest.mock( '@elementor/editor-mcp', () => ( {
	hasLoadedEditorAngie: jest.fn( () => false ),
	isAngieAvailable: jest.fn( () => false ),
	openAngieInAskMode: jest.fn(),
} ) );

describe( 'SidebarHelp', () => {
	it( 'should be disabled and not open the menu while the rail is locked', () => {
		// Arrange.
		jest.mocked( useIsSidebarRailLocked ).mockReturnValue( true );

		// Act.
		render( <SidebarHelp /> );

		const button = screen.getByRole( 'button', { name: 'Help' } );

		fireEvent.click( button );

		// Assert.
		expect( button ).toBeDisabled();
		expect( screen.queryByText( 'Help Center' ) ).not.toBeInTheDocument();
	} );

	it( 'should be enabled and open the menu while the rail is not locked', () => {
		// Arrange.
		jest.mocked( useIsSidebarRailLocked ).mockReturnValue( false );

		// Act.
		render( <SidebarHelp /> );

		const button = screen.getByRole( 'button', { name: 'Help' } );

		fireEvent.click( button );

		// Assert.
		expect( button ).toBeEnabled();
		expect( screen.getByText( 'Help Center' ) ).toBeInTheDocument();
	} );
} );
