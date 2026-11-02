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
	...overrides,
} );

describe( '<SecondaryBar />', () => {
	afterEach( () => {
		delete window.$e;
	} );

	it( 'should render the tabs as links and mark the active one', () => {
		// Act
		render( <SecondaryBar config={ createConfig() } /> );

		// Assert
		expect( screen.getByRole( 'navigation', { name: 'Settings section' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'tab', { name: 'Settings' } ) ).toHaveAttribute( 'href', '/settings' );
		expect( screen.getByRole( 'tab', { name: 'Settings' } ) ).toHaveAttribute( 'aria-current', 'page' );
		expect( screen.getByRole( 'tab', { name: 'Tools' } ) ).not.toHaveAttribute( 'aria-current' );
	} );

	it( 'should hide the addons menu when there are no addons', () => {
		// Act
		render( <SecondaryBar config={ createConfig() } /> );

		// Assert
		expect( screen.queryByRole( 'button', { name: 'Addons' } ) ).not.toBeInTheDocument();
	} );

	it( 'should list the addons links when the menu is opened', () => {
		// Arrange
		render( <SecondaryBar config={ createConfig( { addons: [ { label: 'Dev Tools', url: '/dev-tools' } ] } ) } /> );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Addons' } ) );

		// Assert
		expect( screen.getByRole( 'menuitem', { name: 'Dev Tools' } ) ).toHaveAttribute( 'href', '/dev-tools' );
	} );

	it( 'should close the addons menu with Escape and return the focus to the button', async () => {
		// Arrange
		render( <SecondaryBar config={ createConfig( { addons: [ { label: 'Dev Tools', url: '/dev-tools' } ] } ) } /> );
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
} );
