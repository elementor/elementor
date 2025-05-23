import { render } from '@testing-library/react';
import MainMenuLocation from '../main-menu-location';
import ToolsMenuLocation from '../tools-menu-location';
import UtilitiesMenuLocation from '../utilities-menu-location';
import { mainMenu, toolsMenu, utilitiesMenu } from '../../../locations';
import { createMockMenuAction, createMockMenuLink, createMockMenuToggleAction } from 'test-utils';

describe( '@elementor/top-bar - Menus components', () => {
	describe( 'Main menu', () => {
		it( 'should render ordered menu items in a popover', () => {
			// Arrange.
			mainMenu.registerAction( {
				...createMockMenuAction(),
				name: 'test-action',
			} );

			mainMenu.registerToggleAction( {
				...createMockMenuToggleAction(),
				name: 'test-toggle-action',
			} );

			mainMenu.registerLink( {
				...createMockMenuLink(),
				group: 'exits',
				name: 'test-link',
			} );

			// Act.
			const { getByRole, getAllByRole } = render( <MainMenuLocation /> );

			getByRole( 'button' ).click(); // Opens the popover menu

			// Assert.
			const menuItems = getAllByRole( 'menuitem' );

			expect( menuItems ).toHaveLength( 3 );

			// Ensure the last one is the link, so the order is correct (`default`, then `exits`).
			expect( menuItems[ 2 ] ).toHaveAttribute( 'href', 'https://elementor.com' );
		} );
	} );

	describe.each( [
		{
			menuName: 'Tools',
			menu: toolsMenu,
			maxItems: 5,
			Component: ToolsMenuLocation,
		},
		{
			menuName: 'Utilities',
			menu: utilitiesMenu,
			maxItems: 3,
			Component: UtilitiesMenuLocation,
		},
	] )( '$menuName menu', ( { maxItems, menu, Component } ) => {
		it( `should render ${ maxItems } menu items in a toolbar and the rest in a popover`, () => {
			// Arrange.
			const extraAfterMax = 2;

			for ( let i = 0; i < maxItems + extraAfterMax; i++ ) {
				menu.registerAction( {
					name: `test-${ i }`,
					props: {
						title: `Test ${ i }`,
						icon: () => <span>a</span>,
					},
				} );
			}

			// Act.
			const { getAllByRole } = render( <Component /> );

			// Assert.
			const toolbarButtons = getAllByRole( 'button' );
			const popoverButton = toolbarButtons[ maxItems ];

			expect( toolbarButtons ).toHaveLength( maxItems + 1 ); // Including the popover button.
			expect( popoverButton ).toHaveAttribute( 'aria-label', 'More' );

			// Act.
			popoverButton.click();

			// Assert.
			expect( getAllByRole( 'menuitem' ) ).toHaveLength( extraAfterMax );
		} );
	} );
} );
