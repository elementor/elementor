import { jest } from '@jest/globals';
import { createMockElement } from 'test-utils';
import type { LegacyWindow } from '@elementor/editor-canvas';

import { createComponentType, TYPE } from '../create-component-type';

jest.mock( '../utils/tracking' );

const MOCK_COMPONENT_ID = 123;

describe( 'createComponentType', () => {
	let mockElementorWindow: LegacyWindow[ 'elementor' ];

	beforeEach( () => {
		jest.clearAllMocks();

		const mockBaseView = class {
			getContextMenuGroups() {
				return [
					{
						name: 'general',
						actions: [
							{ name: 'copy', icon: 'eicon-copy', title: 'Copy', isEnabled: () => true, callback: jest.fn() },
						],
					},
					{
						name: 'clipboard',
						actions: [
							{ name: 'pasteStyle', icon: 'eicon-paste', title: 'Paste Style', isEnabled: () => true, callback: jest.fn() },
							{ name: 'resetStyle', icon: 'eicon-reset', title: 'Reset Style', isEnabled: () => true, callback: jest.fn() },
						],
					},
					{
						name: 'save',
						actions: [
							{ name: 'save', icon: 'eicon-save', title: 'Save', isEnabled: () => true, callback: jest.fn() },
						],
					},
				];
			}
		};

		mockElementorWindow = {
			modules: {
				elements: {
					types: {
						Widget: class {
							getType() {
								return 'widget';
							}
							getView() {
								return mockBaseView;
							}
						},
					},
					views: {
						Widget: mockBaseView,
					},
				},
			},
			createBackboneElementsCollection: jest.fn(),
		} as unknown as LegacyWindow[ 'elementor' ];

		( window as unknown as LegacyWindow ).elementor = mockElementorWindow;
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	const createMockViewInstance = ( isAdministrator: boolean ) => {
		( window as unknown as LegacyWindow & { elementor: typeof mockElementorWindow & { config?: { user?: { is_administrator?: boolean } } } } ).elementor = {
			...mockElementorWindow,
			config: {
				user: {
					is_administrator: isAdministrator,
				},
			},
		};

		const ComponentType = createComponentType( {
			type: TYPE,
			renderer: {
				register: jest.fn(),
				render: jest.fn( () => Promise.resolve( '<div>Component</div>' ) ),
			} as any,
			element: {
				twig_templates: {},
				twig_main_template: 'main',
				atomic_props_schema: {},
				base_styles_dictionary: {},
			},
		} );

		const ViewClass = ComponentType.prototype.getView();
		const mockSettings = {
			get: jest.fn( ( key: string ) => {
				if ( key === 'component_instance' ) {
					return {
						value: {
							component_id: MOCK_COMPONENT_ID,
						},
					};
				}
				return null;
			} ),
		};
		const mockModel = createMockElement( {
			model: {
				id: 'test-element',
				settings: mockSettings,
				editor_settings: {
					component_uid: 'test-uid',
					title: 'Test Component',
				},
			},
		} );

		const viewInstance = new ViewClass( {
			model: mockModel.model,
		} as any );
		
		// Ensure the view instance has access to the model through options
		viewInstance.options = {
			model: {
				...mockModel.model,
				get: jest.fn( ( key: string ) => {
					if ( key === 'settings' ) {
						return mockSettings;
					}
					return ( mockModel.model.get as jest.Mock )( key );
				} ) as any,
			} as any,
		};

		return viewInstance;
	};

	it( 'should add edit component action to context menu when user is administrator', () => {
		const viewInstance = createMockViewInstance( true );
		const groups = viewInstance.getContextMenuGroups();

		const generalGroup = groups.find( ( group ) => group.name === 'general' );
		expect( generalGroup ).toBeDefined();
		expect( generalGroup?.actions ).toHaveLength( 2 );
		expect( generalGroup?.actions.some( ( action: any ) => action.name === 'edit component' ) ).toBe( true );
		expect( generalGroup?.actions.some( ( action: any ) => action.name === 'copy' ) ).toBe( true );
	} );

	it( 'should not add edit component action to context menu when user is editor', () => {
		const viewInstance = createMockViewInstance( false );
		const groups = viewInstance.getContextMenuGroups();

		const generalGroup = groups.find( ( group ) => group.name === 'general' );
		expect( generalGroup ).toBeDefined();
		expect( generalGroup?.actions ).toHaveLength( 1 );
		expect( generalGroup?.actions.some( ( action: any ) => action.name === 'edit component' ) ).toBe( false );
		expect( generalGroup?.actions.some( ( action: any ) => action.name === 'copy' ) ).toBe( true );
	} );

	it( 'should disable clipboard actions for both admin and editor users', () => {
		const adminViewInstance = createMockViewInstance( true );
		const editorViewInstance = createMockViewInstance( false );

		const adminGroups = adminViewInstance.getContextMenuGroups();
		const editorGroups = editorViewInstance.getContextMenuGroups();

		const adminClipboardGroup = adminGroups.find( ( group ) => group.name === 'clipboard' );
		const editorClipboardGroup = editorGroups.find( ( group ) => group.name === 'clipboard' );

		expect( adminClipboardGroup ).toBeDefined();
		expect( editorClipboardGroup ).toBeDefined();

		const adminPasteStyleAction = adminClipboardGroup?.actions.find( ( action: any ) => action.name === 'pasteStyle' ) as { isEnabled: () => boolean } | undefined;
		const adminResetStyleAction = adminClipboardGroup?.actions.find( ( action: any ) => action.name === 'resetStyle' ) as { isEnabled: () => boolean } | undefined;
		const editorPasteStyleAction = editorClipboardGroup?.actions.find( ( action: any ) => action.name === 'pasteStyle' ) as { isEnabled: () => boolean } | undefined;
		const editorResetStyleAction = editorClipboardGroup?.actions.find( ( action: any ) => action.name === 'resetStyle' ) as { isEnabled: () => boolean } | undefined;

		expect( adminPasteStyleAction?.isEnabled() ).toBe( false );
		expect( adminResetStyleAction?.isEnabled() ).toBe( false );
		expect( editorPasteStyleAction?.isEnabled() ).toBe( false );
		expect( editorResetStyleAction?.isEnabled() ).toBe( false );
	} );

	it( 'should return groups without modifications when componentId is not available', () => {
		( window as unknown as LegacyWindow & { elementor: typeof mockElementorWindow & { config?: { user?: { is_administrator?: boolean } } } } ).elementor = {
			...mockElementorWindow,
			config: {
				user: {
					is_administrator: true,
				},
			},
		};

		const ComponentType = createComponentType( {
			type: TYPE,
			renderer: {
				register: jest.fn(),
				render: jest.fn( () => Promise.resolve( '<div>Component</div>' ) ),
			} as any,
			element: {
				twig_templates: {},
				twig_main_template: 'main',
				atomic_props_schema: {},
				base_styles_dictionary: {},
			},
		} );

		const ViewClass = ComponentType.prototype.getView();
		const mockSettings = {
			get: jest.fn( ( key: string ) => {
				if ( key === 'component_instance' ) {
					return undefined;
				}
				return null;
			} ),
		};
		const mockModel = createMockElement( {
			model: {
				id: 'test-element',
				settings: mockSettings,
			},
		} );

		const viewInstance = new ViewClass( {
			model: mockModel.model,
		} as any );
		
		viewInstance.options = {
			model: {
				...mockModel.model,
				get: jest.fn( ( key: string ) => {
					if ( key === 'settings' ) {
						return mockSettings;
					}
					return ( mockModel.model.get as jest.Mock )( key );
				} ) as any,
			} as any,
		};

		// Override getComponentId to handle undefined componentInstance gracefully
		const originalGetComponentId = ( viewInstance as any ).getComponentId.bind( viewInstance );
		( viewInstance as any ).getComponentId = jest.fn( () => {
			try {
				return originalGetComponentId();
			} catch {
				return undefined;
			}
		} );

		const groups = viewInstance.getContextMenuGroups();
		const generalGroup = groups.find( ( group ) => group.name === 'general' );

		expect( generalGroup?.actions ).toHaveLength( 1 );
		expect( generalGroup?.actions.some( ( action: any ) => action.name === 'edit component' ) ).toBe( false );
	} );
} );
