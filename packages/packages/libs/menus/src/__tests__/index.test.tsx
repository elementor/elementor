import * as React from 'react';
import { useState } from 'react';
import { renderWithTheme } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { createMenu, type Menu } from '../index';
import { type Components } from '../types';

describe( 'createMenu', () => {
	it( 'should create a menu with groups and append a default group', () => {
		// Act.
		const menu = createMenu( {
			components: {
				Button: () => <button>Button</button>,
				Link: () => <a href="https://localhost">Link</a>,
			},
			groups: [ 'testGroup' ],
		} );

		menu.registerButton( {
			id: 'test',
		} );

		menu.registerLink( {
			id: 'test1',
			group: 'testGroup',
		} );

		renderMenu( menu );

		// Assert.
		expect( screen.getByRole( 'button' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'link' ) ).toBeInTheDocument();
	} );

	it( 'should register an item with props', () => {
		// Act.
		const menu = createMenu( {
			components: {
				Link: ( props: { text: string; href: string } ) => <a href={ props.href }>{ props.text }</a>,
			},
		} );

		menu.registerLink( {
			id: 'test',
			props: {
				text: 'Test',
				href: 'https://localhost',
			},
		} );

		renderMenu( menu );

		// Assert.
		const link = screen.getByRole( 'link' );

		expect( link ).toBeInTheDocument();
		expect( link ).toHaveTextContent( 'Test' );
		expect( link ).toHaveAttribute( 'href', 'https://localhost' );
	} );

	it( 'should register an item with reactive props', () => {
		// Act.
		const menu = createMenu( {
			components: {
				Button: ( props: { text: string; onClick: () => void } ) => (
					<button onClick={ props.onClick }>{ props.text }</button>
				),
			},
		} );

		menu.registerButton( {
			id: 'test',
			useProps: () => {
				const [ text, setText ] = useState( 'initial-value' );

				return {
					text,
					onClick: () => {
						setText( 'new-value' );
					},
				};
			},
		} );

		renderMenu( menu );

		// Assert.
		const button = screen.getByRole( 'button' );

		expect( button ).toBeInTheDocument();
		expect( button ).toHaveTextContent( 'initial-value' );

		fireEvent.click( button );

		expect( button ).toHaveTextContent( 'new-value' );
	} );

	it( 'should not register an item when passing a non-existing group', () => {
		// Act.
		const menu = createMenu( {
			components: {
				Link: () => <a href="https://localhost">Link</a>,
			},
		} );

		menu.registerLink( {
			id: 'test',
			group: 'non-existing-group' as 'default', // Simulate a runtime error.
		} );

		renderMenu( menu );

		// Assert.
		expect( screen.queryByRole( 'link' ) ).not.toBeInTheDocument();
	} );

	it( 'should support menu items priority', () => {
		// Act.
		const menu = createMenu( {
			components: {
				Link: ( { text }: { text: string } ) => <a href="https://localhost">{ text }</a>,
			},
		} );

		menu.registerLink( {
			id: 'test-1',
			priority: 10,
			props: {
				text: 'Link 1',
			},
		} );

		menu.registerLink( {
			id: 'test-2',
			priority: 1,
			props: {
				text: 'Link 2',
			},
		} );

		renderMenu( menu );

		// Assert.
		const links = screen.getAllByRole( 'link' );

		expect( links[ 0 ] ).toHaveTextContent( 'Link 2' );
		expect( links[ 1 ] ).toHaveTextContent( 'Link 1' );
	} );

	it( 'should support overwriting an already existing menu item', () => {
		// Act.
		const menu = createMenu( {
			components: {
				Link: ( { text }: { text: string } ) => <a href="https://localhost">{ text }</a>,
			},
		} );

		menu.registerLink( {
			id: 'test',
			props: {
				text: 'Original',
			},
		} );

		menu.registerLink( {
			id: 'test',
			overwrite: true,
			props: {
				text: 'Replaced',
			},
		} );

		renderMenu( menu );

		// Assert.
		const link = screen.getByRole( 'link' );

		expect( link ).toHaveTextContent( 'Replaced' );
	} );

	it( 'should warn when registering an existing menu item id', () => {
		// Act.
		const menu = createMenu( {
			components: {
				Link: ( { text }: { text: string } ) => <a href="https://localhost">{ text }</a>,
			},
		} );

		menu.registerLink( {
			id: 'test',
			props: {
				text: 'Original',
			},
		} );

		menu.registerLink( {
			id: 'test',
			props: {
				text: 'Replaced',
			},
		} );

		// Assert.
		expect( console ).toHaveWarned();
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
