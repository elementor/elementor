import { toolsMenu } from '@elementor/editor-app-bar';
import { isSidebarEnabled, sidebarTools } from '@elementor/editor-sidebar';

import { init } from '../init';
import { useOpenDesignSystemToolbar } from '../use-open-design-system-toolbar';
import { useSidebarDesignSystemProps } from '../use-sidebar-design-system-props';

jest.mock( '@elementor/editor', () => ( { injectIntoLogic: jest.fn() } ) );
jest.mock( '@elementor/editor-app-bar', () => ( { toolsMenu: { registerToggleAction: jest.fn() } } ) );
jest.mock( '@elementor/editor-panels', () => ( { registerPanel: jest.fn() } ) );
jest.mock( '@elementor/editor-sidebar', () => ( {
	isSidebarEnabled: jest.fn(),
	sidebarTools: { registerToggleAction: jest.fn() },
} ) );
jest.mock( '../design-system-panel', () => ( { panel: {} } ) );
jest.mock( '../components/design-system-entrypoints', () => ( { DesignSystemEntrypoints: () => null } ) );
jest.mock( '../use-open-design-system-toolbar', () => ( { useOpenDesignSystemToolbar: jest.fn() } ) );
jest.mock( '../use-sidebar-design-system-props', () => ( { useSidebarDesignSystemProps: jest.fn() } ) );

describe( 'init', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should register the sidebar props hook when the sidebar is enabled', () => {
		jest.mocked( isSidebarEnabled ).mockReturnValue( true );

		init();

		expect( sidebarTools.registerToggleAction ).toHaveBeenCalledWith(
			expect.objectContaining( { useProps: useSidebarDesignSystemProps } )
		);
		expect( toolsMenu.registerToggleAction ).not.toHaveBeenCalled();
	} );

	it( 'should register the unchanged toolbar hook in the app bar when the sidebar is off', () => {
		jest.mocked( isSidebarEnabled ).mockReturnValue( false );

		init();

		expect( toolsMenu.registerToggleAction ).toHaveBeenCalledWith(
			expect.objectContaining( { useProps: useOpenDesignSystemToolbar } )
		);
		expect( sidebarTools.registerToggleAction ).not.toHaveBeenCalled();
	} );
} );
