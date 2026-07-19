import * as React from 'react';
import { createMockDocument, renderWithTheme } from 'test-utils';
import { __useActiveDocument as useActiveDocument } from '@elementor/editor-documents';
import { act, screen } from '@testing-library/react';

import AppBar from '../components/app-bar';
import { MIN_APP_BAR_WIDTH } from '../constants';
import { toolsMenu, utilitiesMenu } from '../locations';

jest.mock( '@elementor/editor-documents', () => ( {
	__useActiveDocument: jest.fn(),
} ) );

jest.mock( '@elementor/editor-current-user', () => ( {
	useCurrentUserCapabilities: () => ( { isAdmin: true, canUser: jest.fn(), capabilities: [] } ),
} ) );

type ResizeCallback = ( entries: Array< { contentRect: { width: number } } > ) => void;

class MockResizeObserver {
	static instances: MockResizeObserver[] = [];
	callback: ResizeCallback;

	constructor( callback: ResizeCallback ) {
		this.callback = callback;
		MockResizeObserver.instances.push( this );
	}

	observe() {}
	unobserve() {}
	disconnect() {}

	trigger( width: number ) {
		this.callback( [ { contentRect: { width } } ] );
	}
}

function registerMenuActions( menu: typeof toolsMenu | typeof utilitiesMenu, count: number ) {
	for ( let i = 0; i < count; i++ ) {
		menu.registerAction( {
			id: `test-${ menu === toolsMenu ? 'tools' : 'utilities' }-${ i }`,
			props: {
				title: `Test ${ i }`,
				icon: () => <span>icon</span>,
			},
		} );
	}
}

describe( '@elementor/editor-app-bar - AppBar', () => {
	const originalResizeObserver = globalThis.ResizeObserver;

	beforeEach( () => {
		jest.mocked( useActiveDocument ).mockReturnValue(
			createMockDocument( {
				permissions: { allowAddingWidgets: true, showCopyAndShare: false },
			} )
		);

		MockResizeObserver.instances = [];
		globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
	} );

	afterEach( () => {
		globalThis.ResizeObserver = originalResizeObserver;
	} );

	it( 'should collapse the tools and utilities menus into their "More" popovers as the app bar narrows', () => {
		// Arrange.
		registerMenuActions( toolsMenu, 5 );
		registerMenuActions( utilitiesMenu, 4 );

		renderWithTheme( <AppBar /> );

		// At full width, all the registered items are shown inline (no "More" popover needed).
		expect( screen.queryByLabelText( 'More' ) ).not.toBeInTheDocument();

		// Act.
		act( () => {
			MockResizeObserver.instances.forEach( ( observer ) => observer.trigger( 400 ) );
		} );

		// Assert - narrowing the app bar moves items from the tools/utilities menus into "More" popovers.
		expect( screen.getAllByLabelText( 'More' ) ).toHaveLength( 2 );
	} );

	it( 'should not shrink the app bar content below MIN_APP_BAR_WIDTH, so it scrolls horizontally instead', () => {
		// Arrange.
		renderWithTheme( <AppBar /> );

		// Act.
		act( () => {
			MockResizeObserver.instances.forEach( ( observer ) => observer.trigger( 400 ) );
		} );

		// Assert - the grid content keeps its min-width floor regardless of how narrow the app bar itself is.
		// eslint-disable-next-line testing-library/no-node-access -- no accessible role/label exists for this structural layout container.
		const grid = document.querySelector( '.MuiToolbar-root > div' ) as HTMLElement;

		expect( getComputedStyle( grid ).minWidth ).toBe( `${ MIN_APP_BAR_WIDTH }px` );
	} );
} );
