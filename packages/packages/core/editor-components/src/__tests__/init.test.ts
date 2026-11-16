import { injectTab } from '@elementor/editor-elements-panel';
import { registerPanel } from '@elementor/editor-panels';
import { isSidebarEnabled, sidebarTools } from '@elementor/editor-sidebar';

import { init } from '../init';

jest.mock( '../component-instance-transformer', () => ( { componentInstanceTransformer: jest.fn() } ) );
jest.mock( '../component-overridable-transformer', () => ( { componentOverridableTransformer: jest.fn() } ) );
jest.mock( '../component-override-transformer', () => ( { componentOverrideTransformer: jest.fn() } ) );
jest.mock( '@elementor/editor', () => ( { injectIntoLogic: jest.fn() } ) );
jest.mock( '@elementor/editor-canvas', () => ( {
	registerElementType: jest.fn(),
	settingsTransformersRegistry: { register: jest.fn() },
} ) );
jest.mock( '@elementor/editor-documents', () => ( { getV1CurrentDocument: jest.fn() } ) );
jest.mock( '@elementor/editor-editing-panel', () => ( { registerEditingPanelReplacement: jest.fn() } ) );
jest.mock( '@elementor/editor-elements-panel', () => ( { injectTab: jest.fn() } ) );
jest.mock( '@elementor/editor-embedded-documents-manager', () => ( {
	embeddedDocumentsManager: { onDocumentLoad: jest.fn() },
} ) );
jest.mock( '@elementor/editor-panels', () => ( {
	createPanel: jest.fn( () => ( { panel: {}, usePanelStatus: jest.fn(), usePanelActions: jest.fn() } ) ),
	registerPanel: jest.fn(),
} ) );
jest.mock( '@elementor/editor-sidebar', () => ( {
	isSidebarEnabled: jest.fn(),
	sidebarTools: { registerToggleAction: jest.fn() },
} ) );
jest.mock( '@elementor/editor-v1-adapters', () => ( { registerDataHook: jest.fn() } ) );
jest.mock( '@elementor/store', () => ( { ...jest.requireActual( '@elementor/store' ), __registerSlice: jest.fn() } ) );
jest.mock( '../sync/before-save', () => ( { beforeSave: jest.fn() } ) );
jest.mock( '../prevent-circular-nesting', () => ( { initCircularNestingPrevention: jest.fn() } ) );
jest.mock( '../sync/load-component-data-after-instance-added', () => ( {
	initLoadComponentDataAfterInstanceAdded: jest.fn(),
} ) );
jest.mock( '../components/components-tab/components', () => ( { Components: jest.fn() } ) );
jest.mock( '../components/instance-editing-panel/instance-editing-panel', () => ( {
	InstanceEditingPanel: jest.fn(),
} ) );
jest.mock( '../components/load-template-components', () => ( { LoadTemplateComponents: jest.fn() } ) );
jest.mock( '../populate-store', () => ( { PopulateStore: jest.fn() } ) );
jest.mock( '../create-component-type', () => ( {
	COMPONENT_WIDGET_TYPE: 'e-component',
	createComponentType: jest.fn(),
} ) );
jest.mock( '../store/actions/load-components-assets', () => ( { loadComponentsAssets: jest.fn() } ) );
jest.mock( '../store/actions/remove-component-styles', () => ( { removeComponentStyles: jest.fn() } ) );

describe( 'editor-components init', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		( window as never as { elementorCommon: object } ).elementorCommon = {};
	} );

	it( 'should register the sidebar panel and button without the tab when the sidebar is enabled', () => {
		// Arrange.
		jest.mocked( isSidebarEnabled ).mockReturnValue( true );

		// Act.
		init();

		// Assert.
		expect( registerPanel ).toHaveBeenCalledTimes( 1 );
		expect( sidebarTools.registerToggleAction ).toHaveBeenCalledWith(
			expect.objectContaining( { id: 'open-components-panel' } )
		);
		expect( injectTab ).not.toHaveBeenCalled();
	} );

	it( 'should inject the elements panel tab only when the sidebar is disabled', () => {
		// Arrange.
		jest.mocked( isSidebarEnabled ).mockReturnValue( false );

		// Act.
		init();

		// Assert.
		expect( injectTab ).toHaveBeenCalledWith( expect.objectContaining( { id: 'components' } ) );
		expect( registerPanel ).not.toHaveBeenCalled();
		expect( sidebarTools.registerToggleAction ).not.toHaveBeenCalled();
	} );
} );
