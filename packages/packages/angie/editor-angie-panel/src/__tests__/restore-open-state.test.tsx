import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { createFloatingPanel, init as initFloatingPanels } from '@elementor/editor-floating-panels';
import {
	__createStore,
	__deleteStore,
	__getState,
	__getStore,
	__StoreProvider as StoreProvider,
} from '@elementor/store';

import AngiePanel from '../components/angie-panel';
import { angiePanel } from '../editor-panel';

const mockBootAngieSdk = jest.fn();
const mockCanUseAngiePluginSidebar = jest.fn();

jest.mock( '@elementor/editor', () => ( {
	injectIntoTop: jest.fn(),
} ) );

jest.mock( '@elementor/editor-angie', () => ( {
	bootAngieSdk: ( ...args: unknown[] ) => mockBootAngieSdk( ...args ),
	canUseAngiePluginSidebar: () => mockCanUseAngiePluginSidebar(),
	EDITOR_ANGIE_CONTAINER_ID: 'elementor-editor-angie',
} ) );

const persistAngiePanelOpen = () => {
	localStorage.setItem(
		'elementor_floating_panels_state',
		JSON.stringify( {
			'angie-panel': {
				isOpen: true,
				zIndex: 1,
				corner: 'block-start-inline-end',
				size: { inlineSize: 400, blockSize: 720 },
				position: { insetBlockStart: 48, insetBlockEnd: 0, insetInlineStart: 0, insetInlineEnd: 0 },
			},
		} )
	);
};

const isAngiePanelOpen = (): boolean => __getState().floatingPanels.byId[ angiePanel.panel.id ].isOpen;

/**
 * Simulates an editor reload with the real floating-panels store: it reads localStorage, registers the
 * production Angie panel declaration, then mounts the panel component.
 */
const reloadEditor = () => {
	initFloatingPanels();
	createFloatingPanel( angiePanel.panel );
	const store = __createStore();

	renderWithTheme(
		<StoreProvider store={ store }>
			<AngiePanel />
		</StoreProvider>
	);
};

describe( 'Angie panel open state after reload', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		// Drops the registration queued when `editor-panel` was imported without a store.
		__deleteStore();
		localStorage.clear();
		mockBootAngieSdk.mockResolvedValue( {} );
		persistAngiePanelOpen();
	} );

	afterEach( () => {
		if ( __getStore() ) {
			__deleteStore();
		}
	} );

	it( 'closes the restored panel and skips the Core SDK when the plugin sidebar hosts Angie', () => {
		// Arrange
		mockCanUseAngiePluginSidebar.mockReturnValue( true );

		// Act
		reloadEditor();

		// Assert
		expect( isAngiePanelOpen() ).toBe( false );
		expect( mockBootAngieSdk ).not.toHaveBeenCalled();
	} );

	it( 'restores the panel open and boots the Core SDK when the plugin sidebar is not usable', () => {
		// Arrange
		mockCanUseAngiePluginSidebar.mockReturnValue( false );

		// Act
		reloadEditor();

		// Assert
		expect( isAngiePanelOpen() ).toBe( true );
		expect( mockBootAngieSdk ).toHaveBeenCalledTimes( 1 );
	} );
} );
