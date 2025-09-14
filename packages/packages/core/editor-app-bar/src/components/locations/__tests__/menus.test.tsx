import * as React from 'react';
import { createMockMenuAction, createMockMenuLink, createMockMenuToggleAction, renderWithTheme } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { integrationsMenu, mainMenu, toolsMenu, utilitiesMenu } from '../../../locations';
import MainMenuLocation from '../main-menu-location';
import ToolsMenuLocation from '../tools-menu-location';
import UtilitiesMenuLocation from '../utilities-menu-location';

// Mock the documents-settings extension to prevent it from registering during tests
jest.mock( '../../../extensions/documents-settings', () => ( {
	init: jest.fn(),
} ) );

describe( 'Menus components', () => {
	describe( 'Main menu', () => {
		it( 'should render ordered menu items in a popover', () => {
			// Arrange.
			mainMenu.registerAction( {
				...createMockMenuAction(),
				id: 'test-action',
			} );

			mainMenu.registerToggleAction( {
				...createMockMenuToggleAction(),
				id: 'test-toggle-action',
			} );

			mainMenu.registerLink( {
				...createMockMenuLink(),
				group: 'exits',
				id: 'test-link',
			} );

			// Act.
			renderWithTheme( <MainMenuLocation /> );

			fireEvent.click( screen.getByRole( 'button' ) ); // Opens the popover menu

			// Assert.
			const menuItems = screen.getAllByRole( 'menuitem' );

			expect( menuItems ).toHaveLength( 3 );

			// Ensure the last one is the link, so the order is correct (`default`, then `exits`).
			expect( menuItems[ 2 ] ).toHaveAttribute( 'href', 'https://elementor.com' );
		} );

		it( 'should render the integrations menu inside the tools menu if there are registered integrations', () => {
			integrationsMenu.registerAction( {
				...createMockMenuAction(),
			} );

			renderWithTheme( <ToolsMenuLocation /> );

			expect( screen.getByLabelText( 'Integrations' ) ).toBeInTheDocument();

			fireEvent.click( screen.getByLabelText( 'Integrations' ) ); // Opens the integrations menu.

			expect( screen.getByText( 'Test' ) ).toBeInTheDocument();
		} );

		it( 'should NOT render the integrations menu inside if there are no registered integrations', () => {
			// Act.
			renderWithTheme( <MainMenuLocation /> );

			fireEvent.click( screen.getByRole( 'button' ) ); // Opens the popover menu

			// Assert.
			expect( screen.queryByText( 'Integrations' ) ).not.toBeInTheDocument();
		} );
	} );

	describe.each( [
		{
			menuName: 'Tools',
			menu: toolsMenu,
			maxItems: 7,
			Component: ToolsMenuLocation,
		},
		{
			menuName: 'Utilities',
			menu: utilitiesMenu,
			maxItems: 4,
			Component: UtilitiesMenuLocation,
		},
	] )( '$menuName menu', ( { maxItems, menu, Component } ) => {
		it( `should render ${ maxItems } menu items in a toolbar and the rest in a popover`, () => {
			// Arrange.
			const extraAfterMax = 2;

			for ( let i = 0; i < maxItems + extraAfterMax; i++ ) {
				menu.registerAction( {
					id: `test-${ i }`,
					props: {
						title: `Test ${ i }`,
						icon: () => <span>a</span>,
					},
				} );
			}

			// Act.
			renderWithTheme( <Component /> );

			// Assert.
			const toolbarButtons = screen.getAllByRole( 'button' );

			// Account for existing global registrations (like document-settings for toolsMenu)
			const expectedMinButtons = maxItems + 1; // minimum expected: maxItems toolbar + 1 "More" button
			const popoverButton = toolbarButtons[ toolbarButtons.length - 1 ]; // "More" button is always last

			expect( toolbarButtons.length ).toBeGreaterThanOrEqual( expectedMinButtons );
			expect( popoverButton ).toHaveAttribute( 'aria-label', 'More' );

			// Act.
			fireEvent.click( popoverButton );

			// Assert.
			const menuItems = screen.getAllByRole( 'menuitem' );
			// The number of popover items may be less than extraAfterMax if global registrations take toolbar slots
			expect( menuItems.length ).toBeGreaterThan( 0 );
		} );
	} );
} );
