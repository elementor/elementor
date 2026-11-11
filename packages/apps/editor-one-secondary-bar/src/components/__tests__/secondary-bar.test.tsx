import * as React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { type SecondaryBarConfig } from '../../types';
import { SecondaryBar } from '../secondary-bar';

const createConfig = ( overrides: Partial< SecondaryBarConfig > = {} ): SecondaryBarConfig => ( {
	label: 'Settings',
	tabs: [
		{ id: 'settings', label: 'Settings', url: '/settings', is_active: true },
		{ id: 'tools', label: 'Tools', url: '/tools', is_active: false },
	],
	addons: [],
	is_finder_available: true,
	...overrides,
} );

const addons = [ { id: 'dev-tools', label: 'Dev Tools', url: '/dev-tools' } ];

describe( '<SecondaryBar />', () => {
	afterEach( () => {
		delete window.$e;
	} );

	it( 'should render the tabs as links and mark the active one', () => {
		// Act
		render( <SecondaryBar config={ createConfig() } /> );

		// Assert
		expect( screen.getByRole( 'navigation', { name: 'Settings section' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'link', { name: 'Settings' } ) ).toHaveAttribute( 'href', '/settings' );
		expect( screen.getByRole( 'link', { name: 'Settings' } ) ).toHaveAttribute( 'aria-current', 'page' );
		expect( screen.getByRole( 'link', { name: 'Tools' } ) ).not.toHaveAttribute( 'aria-current' );
	} );

	it( 'should keep all tabs reachable with Tab when none is active', () => {
		// Arrange
		const tabs = createConfig().tabs.map( ( tab ) => ( { ...tab, is_active: false } ) );

		// Act
		render( <SecondaryBar config={ createConfig( { tabs } ) } /> );

		// Assert
		screen.getAllByRole( 'link' ).forEach( ( link ) => {
			expect( link ).not.toHaveAttribute( 'aria-current' );
			expect( link ).not.toHaveAttribute( 'tabindex', '-1' );
		} );
	} );

	it( 'should hide the addons menu when there are no addons', () => {
		// Act
		render( <SecondaryBar config={ createConfig() } /> );

		// Assert
		expect( screen.queryByRole( 'button', { name: 'Addons' } ) ).not.toBeInTheDocument();
	} );

	it( 'should list the addons links when the menu is opened', () => {
		// Arrange
		render( <SecondaryBar config={ createConfig( { addons } ) } /> );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Addons' } ) );

		// Assert
		expect( screen.getByRole( 'menuitem', { name: 'Dev Tools' } ) ).toHaveAttribute( 'href', '/dev-tools' );
	} );

	it( 'should close the addons menu with Escape and return the focus to the button', async () => {
		// Arrange
		render( <SecondaryBar config={ createConfig( { addons } ) } /> );
		const button = screen.getByRole( 'button', { name: 'Addons' } );
		button.focus();
		fireEvent.click( button );

		// Act
		fireEvent.keyDown( screen.getByRole( 'menu' ), { key: 'Escape' } );

		// Assert
		await waitFor( () => expect( screen.queryByRole( 'menu' ) ).not.toBeInTheDocument() );
		expect( button ).toHaveFocus();
	} );

	it( 'should open Finder through the existing route', () => {
		// Arrange
		const route = jest.fn();
		window.$e = { route };
		render( <SecondaryBar config={ createConfig() } /> );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Finder' } ) );

		// Assert
		expect( route ).toHaveBeenCalledWith( 'finder' );
	} );

	it( 'should not throw when Finder is clicked without $e', () => {
		// Arrange
		render( <SecondaryBar config={ createConfig() } /> );

		// Act & Assert
		expect( () => fireEvent.click( screen.getByRole( 'button', { name: 'Finder' } ) ) ).not.toThrow();
	} );

	it( 'should render the finder in a fixed-width slot when addons are shown', () => {
		// Act
		render( <SecondaryBar config={ createConfig( { addons } ) } /> );

		// Assert
		expect( screen.getByRole( 'button', { name: 'Finder' } ) ).toBeInTheDocument();
	} );

	it( 'should hide Finder when it is not available', () => {
		// Act
		render( <SecondaryBar config={ createConfig( { is_finder_available: false } ) } /> );

		// Assert
		expect( screen.queryByRole( 'button', { name: 'Finder' } ) ).not.toBeInTheDocument();
	} );
} );
