import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { type Components, type Menu } from '@elementor/menus';
import { fireEvent, screen } from '@testing-library/react';

import { integrationsMenu, mainMenu, toolsMenu, utilitiesMenu } from '../locations';

describe( 'App Bar Menus', () => {
	describe.each( [
		{
			name: 'Main Menu',
			menu: mainMenu,
		},
		{
			name: 'Tools Menu',
			menu: toolsMenu,
		},
		{
			name: 'Utilities Menu',
			menu: utilitiesMenu,
		},
		{
			name: 'Integrations Menu',
			menu: integrationsMenu,
		},
	] as const )( '$name', ( { menu } ) => {
		const items = [
			{
				type: 'action',
				action: 'registerAction',
			},
			{
				type: 'toggle action',
				action: 'registerToggleAction',
			},
			{
				type: 'link',
				action: 'registerLink',
			},
		] as const;

		it.each( items )( 'should register $type with icon', ( { type, action } ) => {
			// Arrange.
			menu[ action ]( {
				id: 'test-item',
				useProps: () => ( {
					title: type,
					icon: () => <>test-icon</>,
				} ),
			} );

			// Act.
			renderMenu( menu as never );

			// Assert.
			expect( screen.getByText( 'test-icon' ) ).toBeInTheDocument();
		} );

		it.each( items )( 'should register $type with tooltip', async ( { action } ) => {
			// Arrange.
			menu[ action ]( {
				id: 'test-item',
				useProps: () => ( {
					title: 'Test Title',
					icon: () => <div />,
				} ),
			} );

			renderMenu( menu as never );

			const item = screen.getByLabelText( 'Test Title' );

			// Act.
			fireEvent.mouseOver( item, { bubbles: true } );

			// Assert.
			expect( await screen.findByRole( 'tooltip' ) ).toHaveTextContent( 'Test Title' );
		} );

		it.each( items )( 'should register hidden $type', ( { type, action } ) => {
			// Arrange.
			menu[ action ]( {
				id: 'hidden',
				useProps: () => ( {
					title: `hidden-${ type }`,
					icon: () => <div />,
					visible: false,
				} ),
			} );

			// Act.
			renderMenu( menu as never );

			// Assert.
			expect( screen.queryByLabelText( `hidden-${ type }` ) ).not.toBeInTheDocument();
		} );
	} );
} );

function renderMenu< TGroups extends string, TComponents extends Components >( menu: Menu< TComponents, TGroups > ) {
	const MenuComponent = () => {
		const groupedItems = menu.useMenuItems();
		const allItems = Object.values( groupedItems ).flat();

		return (
			<div>
				{ allItems.map( ( { MenuItem, id } ) => (
					<MenuItem key={ id } />
				) ) }
			</div>
		);
	};

	return renderWithTheme( <MenuComponent /> );
}
