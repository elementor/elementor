import { injectIntoPageIndication, toolsMenu } from '@elementor/editor-app-bar';
import { registerPanel } from '@elementor/editor-panels';

const mockEnv = { is_pages_panel_active: false };

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

jest.mock( '../env', () => ( {
	env: mockEnv,
} ) );

import { init } from '../init';

describe( '@elementor/editor-site-navigation - init', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockEnv.is_pages_panel_active = false;
	} );

	it( 'registers top bar Recently Edited when pages panel experiment is inactive', () => {
		init();

		expect( injectIntoPageIndication ).toHaveBeenCalledWith(
			expect.objectContaining( { id: 'document-recently-edited' } )
		);
		expect( registerPanel ).not.toHaveBeenCalled();
		expect( toolsMenu.registerToggleAction ).not.toHaveBeenCalled();
	} );

	it( 'skips Recently Edited and registers site content panel when experiment is active', () => {
		mockEnv.is_pages_panel_active = true;

		init();

		expect( injectIntoPageIndication ).not.toHaveBeenCalled();
		expect( registerPanel ).toHaveBeenCalled();
		expect( toolsMenu.registerToggleAction ).toHaveBeenCalled();
	} );
} );
