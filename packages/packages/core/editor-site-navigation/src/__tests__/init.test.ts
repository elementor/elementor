import { injectIntoPageIndication, toolsMenu } from '@elementor/editor-app-bar';
import { registerPanel } from '@elementor/editor-panels';
import { sidebarTools } from '@elementor/editor-sidebar';

import { init } from '../init';

jest.mock( '../env', () => ( {
	env: {
		can_access_site_content_panel: true,
		is_pages_panel_active: true,
	},
} ) );

jest.mock( '@elementor/editor-app-bar', () => ( {
	injectIntoPageIndication: jest.fn(),
	toolsMenu: {
		registerToggleAction: jest.fn(),
	},
} ) );
jest.mock( '@elementor/editor-panels', () => ( {
	registerPanel: jest.fn(),
} ) );
jest.mock( '@elementor/editor-sidebar', () => ( {
	isSidebarEnabled: jest.fn( () => false ),
	sidebarTools: {
		registerToggleAction: jest.fn(),
	},
} ) );
jest.mock( '../components/panel/panel', () => ( {
	panel: { id: 'site-navigation-panel' },
} ) );
jest.mock( '../components/top-bar/recently-edited', () => ( {
	default: jest.fn(),
} ) );
jest.mock( '../hooks/use-toggle-button-props', () => ( {
	useToggleButtonProps: jest.fn(),
} ) );

describe( 'editor-site-navigation init', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		const { env } = jest.requireMock( '../env' ) as {
			env: { can_access_site_content_panel: boolean; is_pages_panel_active: boolean };
		};
		env.is_pages_panel_active = true;
		env.can_access_site_content_panel = true;
	} );

	it( 'registers the panel and toggle when the pages panel is active and the user can access it', () => {
		init();

		expect( injectIntoPageIndication ).toHaveBeenCalled();
		expect( registerPanel ).toHaveBeenCalledWith( { id: 'site-navigation-panel' } );
		expect( toolsMenu.registerToggleAction ).toHaveBeenCalledWith(
			expect.objectContaining( { id: 'toggle-site-navigation-panel' } )
		);
	} );

	it( 'does not register the panel when the user cannot access site content', () => {
		const { env } = jest.requireMock( '../env' ) as {
			env: { can_access_site_content_panel: boolean };
		};
		env.can_access_site_content_panel = false;

		init();

		expect( injectIntoPageIndication ).toHaveBeenCalled();
		expect( registerPanel ).not.toHaveBeenCalled();
		expect( toolsMenu.registerToggleAction ).not.toHaveBeenCalled();
		expect( sidebarTools.registerToggleAction ).not.toHaveBeenCalled();
	} );

	it( 'does not register the panel when the pages panel experiment is off', () => {
		const { env } = jest.requireMock( '../env' ) as {
			env: { is_pages_panel_active: boolean };
		};
		env.is_pages_panel_active = false;

		init();

		expect( registerPanel ).not.toHaveBeenCalled();
	} );
} );