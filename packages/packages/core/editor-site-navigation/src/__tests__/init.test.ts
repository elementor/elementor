import { injectIntoPageIndication, toolsMenu } from '@elementor/editor-app-bar';
import { registerPanel } from '@elementor/editor-panels';

jest.mock( '@elementor/editor-app-bar', () => ( {
	injectIntoPageIndication: jest.fn(),
	toolsMenu: { registerToggleAction: jest.fn() },
} ) );

jest.mock( '@elementor/editor-panels', () => ( {
	registerPanel: jest.fn(),
} ) );

jest.mock( '@elementor/editor-sidebar', () => ( {
	isSidebarEnabled: jest.fn( () => false ),
	sidebarTools: { registerToggleAction: jest.fn() },
} ) );

jest.mock( '../components/panel/panel', () => ( {
	panel: 'site-navigation-panel',
} ) );

jest.mock( '../hooks/use-toggle-button-props', () => ( {
	useToggleButtonProps: jest.fn(),
} ) );

jest.mock( '../env', () => ( {
	env: { is_pages_panel_active: false },
} ) );

import { env } from '../env';
import { init } from '../init';

type PagesPanelEnv = { is_pages_panel_active: boolean };

describe( '@elementor/editor-site-navigation - init', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		( env as PagesPanelEnv ).is_pages_panel_active = false;
	} );

	it( 'registers document title area without site content panel when experiment is inactive', () => {
		init();

		expect( injectIntoPageIndication ).toHaveBeenCalledWith(
			expect.objectContaining( { id: 'document-recently-edited' } )
		);
		expect( registerPanel ).not.toHaveBeenCalled();
		expect( toolsMenu.registerToggleAction ).not.toHaveBeenCalled();
	} );

	it( 'registers document title area and site content panel when experiment is active', () => {
		( env as PagesPanelEnv ).is_pages_panel_active = true;

		init();

		expect( injectIntoPageIndication ).toHaveBeenCalledWith(
			expect.objectContaining( { id: 'document-recently-edited' } )
		);
		expect( registerPanel ).toHaveBeenCalled();
		expect( toolsMenu.registerToggleAction ).toHaveBeenCalled();
	} );
} );
