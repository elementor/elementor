import { createMockElement } from 'test-utils';
import type {
	BackboneModel,
	CreateTemplatedElementTypeOptions,
	ElementModel,
	LegacyWindow,
} from '@elementor/editor-canvas';

import { COMPONENT_WIDGET_TYPE, type ContextMenuAction, createComponentType } from '../create-component-type';
import type { ExtendedWindow } from '../types';

const MOCK_COMPONENT_ID = 123;

const createMockRenderer = () => ( {
	register: jest.fn(),
	render: jest.fn( () => Promise.resolve( '<div>Component</div>' ) ),
} as CreateTemplatedElementTypeOptions[ 'renderer' ] );

const createMockElementConfig = () => ( {
	twig_templates: {},
	twig_main_template: 'main',
	atomic_props_schema: {},
	base_styles_dictionary: {},
} );

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
							{
								name: 'copy',
								icon: 'eicon-copy',
								title: 'Copy',
								isEnabled: () => true,
								callback: jest.fn(),
							},
						],
					},
					{
						name: 'clipboard',
						actions: [
							{
								name: 'pasteStyle',
								icon: 'eicon-paste',
								title: 'Paste Style',
								isEnabled: () => true,
								callback: jest.fn(),
							},
							{
								name: 'resetStyle',
								icon: 'eicon-reset',
								title: 'Reset Style',
								isEnabled: () => true,
								callback: jest.fn(),
							},
						],
					},
					{
						name: 'save',
						actions: [
							{
								name: 'save',
								icon: 'eicon-save',
								title: 'Save',
								isEnabled: () => true,
								callback: jest.fn(),
							},
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

		( window as unknown as LegacyWindow & ExtendedWindow ).elementor = mockElementorWindow;

		( window as unknown as LegacyWindow & ExtendedWindow ).elementorCommon = {
			eventsManager: {
				config: {
					triggers: {
						doubleClick: 'doubleClick',
					},
					locations: {
						canvas: 'canvas',
					},
					secondaryLocations: {
						canvasElement: 'canvasElement',
					},
				},
			},
		};
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	const createMockViewInstance = ( isAdministrator: boolean ) => {
		( window as unknown as LegacyWindow & ExtendedWindow ).elementor = {
			...mockElementorWindow,
			config: {
				user: {
					is_administrator: isAdministrator,
				},
			},
		} as LegacyWindow[ 'elementor' ] & {
			config?: { user?: { is_administrator?: boolean } };
		};

		const ComponentType = createComponentType( {
			type: COMPONENT_WIDGET_TYPE,
			renderer: {
				register: jest.fn(),
				render: jest.fn( () => Promise.resolve( '<div>Component</div>' ) ),
			} as CreateTemplatedElementTypeOptions[ 'renderer' ],
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
						$$type: 'component-instance',
						value: {
							component_id: {
								$$type: 'number',
								value: MOCK_COMPONENT_ID,
							},
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
		} as { model: BackboneModel< ElementModel > } );

		viewInstance.options = {
			model: {
				...mockModel.model,
				get: jest.fn( ( key: string ) => {
					if ( key === 'settings' ) {
						return mockSettings;
					}
					return ( mockModel.model.get as jest.Mock )( key );
				} ) as BackboneModel< ElementModel >[ 'get' ],
			} as BackboneModel< ElementModel >,
		};

		return viewInstance;
	};

	it( 'should add edit component action to context menu when user is administrator', () => {
		const viewInstance = createMockViewInstance( true );
		const groups = viewInstance.getContextMenuGroups();

		const generalGroup = groups.find( ( group ) => group.name === 'general' );
		const actions = ( generalGroup?.actions ?? [] ) as ContextMenuAction[];
		expect( generalGroup ).toBeDefined();
		expect( actions ).toHaveLength( 2 );
		expect( actions.some( ( action ) => action.name === 'edit component' ) ).toBe( true );
		expect( actions.some( ( action ) => action.name === 'copy' ) ).toBe( true );
	} );

	it( 'should not add edit component action to context menu when user is editor', () => {
		const viewInstance = createMockViewInstance( false );
		const groups = viewInstance.getContextMenuGroups();

		const generalGroup = groups.find( ( group ) => group.name === 'general' );
		const actions = ( generalGroup?.actions ?? [] ) as ContextMenuAction[];
		expect( generalGroup ).toBeDefined();
		expect( actions ).toHaveLength( 1 );
		expect( actions.some( ( action ) => action.name === 'edit component' ) ).toBe( false );
		expect( actions.some( ( action ) => action.name === 'copy' ) ).toBe( true );
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

		const adminActions = ( adminClipboardGroup?.actions ?? [] ) as ContextMenuAction[];
		const editorActions = ( editorClipboardGroup?.actions ?? [] ) as ContextMenuAction[];
		const adminPasteStyleAction = adminActions.find( ( action ) => action.name === 'pasteStyle' );
		const adminResetStyleAction = adminActions.find( ( action ) => action.name === 'resetStyle' );
		const editorPasteStyleAction = editorActions.find( ( action ) => action.name === 'pasteStyle' );
		const editorResetStyleAction = editorActions.find( ( action ) => action.name === 'resetStyle' );

		expect( adminPasteStyleAction?.isEnabled() ).toBe( false );
		expect( adminResetStyleAction?.isEnabled() ).toBe( false );
		expect( editorPasteStyleAction?.isEnabled() ).toBe( false );
		expect( editorResetStyleAction?.isEnabled() ).toBe( false );
	} );

	it( 'should return groups without modifications when componentId is not available', () => {
		( window as unknown as LegacyWindow & ExtendedWindow ).elementor = {
			...mockElementorWindow,
			config: {
				user: {
					is_administrator: true,
				},
			},
		} as LegacyWindow[ 'elementor' ] & {
			config?: { user?: { is_administrator?: boolean } };
		};

		const ComponentType = createComponentType( {
			type: COMPONENT_WIDGET_TYPE,
			renderer: {
				register: jest.fn(),
				render: jest.fn( () => Promise.resolve( '<div>Component</div>' ) ),
			} as CreateTemplatedElementTypeOptions[ 'renderer' ],
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
		} as { model: BackboneModel< ElementModel > } );

		viewInstance.options = {
			model: {
				...mockModel.model,
				get: jest.fn( ( key: string ) => {
					if ( key === 'settings' ) {
						return mockSettings;
					}
					return ( mockModel.model.get as jest.Mock )( key );
				} ) as BackboneModel< ElementModel >[ 'get' ],
			} as BackboneModel< ElementModel >,
		};

		const originalGetComponentId = (
			viewInstance as unknown as { getComponentId: () => number | undefined }
		 ).getComponentId.bind( viewInstance );
		( viewInstance as unknown as { getComponentId: () => number | undefined } ).getComponentId = jest.fn( () => {
			try {
				return originalGetComponentId();
			} catch {
				return undefined;
			}
		} );

		const groups = viewInstance.getContextMenuGroups();
		const generalGroup = groups.find( ( group ) => group.name === 'general' );
		const actions = ( generalGroup?.actions ?? [] ) as ContextMenuAction[];

		expect( actions ).toHaveLength( 1 );
		expect( actions.some( ( action ) => action.name === 'edit component' ) ).toBe( false );
	} );

	it( 'should return the same view class for multiple type instances', () => {
		// Arrange
		const ComponentType = createComponentType( {
			type: COMPONENT_WIDGET_TYPE,
			renderer: createMockRenderer(),
			element: createMockElementConfig(),
		} );

		// Act
		const typeInstance1 = new ComponentType();
		const typeInstance2 = new ComponentType();
		const viewClass1 = typeInstance1.getView();
		const viewClass2 = typeInstance2.getView();

		// Assert
		expect( viewClass1 ).toBe( viewClass2 );
	} );
} );
