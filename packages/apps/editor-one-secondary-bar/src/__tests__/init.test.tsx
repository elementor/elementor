import { act, screen } from '@testing-library/react';

import { init } from '../init';
import { type SecondaryBarConfig } from '../types';

const config: SecondaryBarConfig = {
	label: 'Settings',
	tabs: [ { id: 'settings', label: 'Settings', url: '/settings', is_active: true } ],
	addons: [ { id: 'dev-tools', label: 'Dev Tools', url: '/dev-tools' } ],
	is_finder_available: false,
};

const addRootElement = () => {
	const root = document.createElement( 'div' );
	root.id = 'editor-one-secondary-bar';
	document.body.appendChild( root );

	return root;
};

describe( 'init', () => {
	afterEach( () => {
		document.body.innerHTML = '';
		document.dir = '';
		delete window.editorOneSecondaryBarConfig;
	} );

	it( 'should do nothing without a root element', () => {
		// Arrange
		window.editorOneSecondaryBarConfig = config;

		// Act
		act( () => init() );

		// Assert
		expect( screen.queryByRole( 'navigation' ) ).not.toBeInTheDocument();
	} );

	it( 'should do nothing without tabs', () => {
		// Arrange
		const root = addRootElement();
		window.editorOneSecondaryBarConfig = { ...config, tabs: [] };

		// Act
		act( () => init() );

		// Assert
		expect( root ).toBeEmptyDOMElement();
	} );

	it( 'should render the bar in RTL', () => {
		// Arrange
		addRootElement();
		document.dir = 'rtl';
		window.editorOneSecondaryBarConfig = config;

		// Act
		act( () => init() );

		// Assert
		expect( screen.getByRole( 'navigation', { name: 'Settings section' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'link', { name: 'Settings' } ) ).toHaveAttribute( 'aria-current', 'page' );
	} );
} );
