import * as React from 'react';
import { useSyncExternalStore } from 'react';
import { act, render, screen } from '@testing-library/react';

import { SIDEBAR_CLASS } from '../../constants';
import { injectIntoSidebarFooter, injectIntoSidebarTools, sidebarTools } from '../../locations';
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

type ItemState = {
	selected?: boolean;
	exclusive?: boolean;
	disabled?: boolean;
	visible?: boolean;
};

const itemStates: Record< string, ItemState > = {};
const listeners = new Set< () => void >();

function setItemState( id: string, state: ItemState ) {
	itemStates[ id ] = state;
	listeners.forEach( ( listener ) => listener() );
}

function useItemState( id: string ) {
	return useSyncExternalStore(
		( listener ) => {
			listeners.add( listener );

			return () => listeners.delete( listener );
		},
		() => itemStates[ id ]
	);
}

describe( 'Sidebar rail exclusive lock', () => {
	const ids = [ 'lock-a', 'lock-b', 'lock-c' ];

	beforeAll( () => {
		ids.forEach( ( id ) => {
			itemStates[ id ] = {};

			sidebarTools.registerToggleAction( {
				id,
				useProps: () => ( {
					title: id,
					icon: () => <span />,
					...useItemState( id ),
				} ),
			} );
		} );
	} );

	afterEach( () => {
		ids.forEach( ( id ) => setItemState( id, {} ) );
	} );

	it( 'should disable the other items and keep the exclusive selected owner enabled', () => {
		// Arrange.
		setItemState( 'lock-a', { selected: true, exclusive: true } );

		// Act.
		render( <Sidebar /> );

		// Assert.
		expect( screen.getByRole( 'button', { name: 'lock-a' } ) ).toBeEnabled();
		expect( screen.getByRole( 'button', { name: 'lock-b' } ) ).toBeDisabled();
		expect( screen.getByRole( 'button', { name: 'lock-c' } ) ).toBeDisabled();
	} );

	it( 'should enable all items when the owner is deselected', () => {
		// Arrange.
		setItemState( 'lock-a', { selected: true, exclusive: true } );
		render( <Sidebar /> );

		// Act.
		act( () => setItemState( 'lock-a', { selected: false, exclusive: true } ) );

		// Assert.
		ids.forEach( ( id ) => expect( screen.getByRole( 'button', { name: id } ) ).toBeEnabled() );
	} );

	it( 'should enable all items when the owner is no longer rendered', () => {
		// Arrange.
		setItemState( 'lock-a', { selected: true, exclusive: true } );
		render( <Sidebar /> );

		// Act.
		act( () => setItemState( 'lock-a', { selected: true, exclusive: true, visible: false } ) );

		// Assert.
		expect( screen.queryByRole( 'button', { name: 'lock-a' } ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'lock-b' } ) ).toBeEnabled();
		expect( screen.getByRole( 'button', { name: 'lock-c' } ) ).toBeEnabled();
	} );

	it( 'should enable all items when the sidebar is unmounted and rendered again', () => {
		// Arrange.
		setItemState( 'lock-a', { selected: true, exclusive: true } );
		const { unmount } = render( <Sidebar /> );

		// Act.
		unmount();
		act( () => setItemState( 'lock-a', {} ) );
		render( <Sidebar /> );

		// Assert.
		ids.forEach( ( id ) => expect( screen.getByRole( 'button', { name: id } ) ).toBeEnabled() );
	} );

	it( 'should keep an item with its own disabled state disabled after the lock is released', () => {
		// Arrange.
		setItemState( 'lock-a', { selected: true, exclusive: true } );
		setItemState( 'lock-b', { disabled: true } );
		render( <Sidebar /> );

		// Act.
		act( () => setItemState( 'lock-a', { selected: false, exclusive: true } ) );

		// Assert.
		expect( screen.getByRole( 'button', { name: 'lock-b' } ) ).toBeDisabled();
		expect( screen.getByRole( 'button', { name: 'lock-c' } ) ).toBeEnabled();
	} );

	it( 'should not forward exclusive to the DOM', () => {
		// Arrange.
		setItemState( 'lock-a', { selected: true, exclusive: true } );

		// Act.
		render( <Sidebar /> );

		// Assert.
		expect( screen.getByRole( 'button', { name: 'lock-a' } ) ).not.toHaveAttribute( 'exclusive' );
	} );

	it( 'should not disable anything for a selected item that is not exclusive', () => {
		// Arrange.
		setItemState( 'lock-a', { selected: true } );

		// Act.
		render( <Sidebar /> );

		// Assert.
		ids.forEach( ( id ) => expect( screen.getByRole( 'button', { name: id } ) ).toBeEnabled() );
	} );
} );
