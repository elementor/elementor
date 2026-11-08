import { registerAngiePanelOpener } from '@elementor/editor-angie';
import { utilitiesMenu } from '@elementor/editor-app-bar';
import { openFloatingPanel, registerFloatingPanel } from '@elementor/editor-floating-panels';

import { ANGIE_PANEL_ID, ANGIE_TOGGLE_ID } from '../constants';
import { init } from '../init';

jest.mock( '@elementor/editor-floating-panels', () => ( {
	createFloatingPanel: jest.fn( ( declaration ) => ( {
		panel: declaration,
		useFloatingPanelStatus: () => ( { isOpen: false } ),
		useFloatingPanelActions: () => ( { toggle: jest.fn() } ),
	} ) ),
	registerFloatingPanel: jest.fn(),
	openFloatingPanel: jest.fn(),
	FloatingPanelHeader: () => null,
	FloatingPanelBody: ( { children }: { children?: unknown } ) => children ?? null,
} ) );

jest.mock( '@elementor/editor-app-bar', () => ( {
	utilitiesMenu: {
		registerToggleAction: jest.fn(),
	},
} ) );

jest.mock( '@elementor/editor-angie', () => ( {
	registerAngiePanelOpener: jest.fn(),
	bootAngieSdk: jest.fn(),
	EDITOR_ANGIE_CONTAINER_ID: 'elementor-editor-angie',
} ) );

jest.mock( '@elementor/icons', () => ( {
	AngieIcon: () => null,
} ) );

describe( 'editor angie panel init', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'registers a docked kept-mounted panel, the app-bar toggle, and the imperative opener', () => {
		init();

		expect( registerFloatingPanel ).toHaveBeenCalledWith(
			expect.objectContaining( {
				id: ANGIE_PANEL_ID,
				isDocked: true,
				keepMounted: true,
			} )
		);
		expect( utilitiesMenu.registerToggleAction ).toHaveBeenCalledWith(
			expect.objectContaining( {
				id: ANGIE_TOGGLE_ID,
			} )
		);
		expect( registerAngiePanelOpener ).toHaveBeenCalledTimes( 1 );

		const opener = ( registerAngiePanelOpener as jest.Mock ).mock.calls[ 0 ][ 0 ] as () => void;
		opener();

		expect( openFloatingPanel ).toHaveBeenCalledWith( ANGIE_PANEL_ID );
	} );
} );
