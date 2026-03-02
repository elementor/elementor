import type { Element } from '@elementor/editor-elements';
import { getSelectedElement, getWidgetsCache } from '@elementor/editor-elements';

import { isProActive } from '../../../utils/is-pro-user';
import {
	CREATE_COMPONENT_SHORTCUT_KEYS,
	initCreateComponentShortcut,
	isCreateComponentAllowed,
	triggerCreateComponentForm,
} from '../create-component-shortcut';

jest.mock( '@elementor/editor-elements', () => ( {
	getSelectedElement: jest.fn(),
	getWidgetsCache: jest.fn(),
} ) );

jest.mock( '../../../utils/is-pro-user', () => ( {
	isProActive: jest.fn(),
} ) );

describe( 'create-component-shortcut', () => {
	const MOCK_ELEMENT_ID = 'test-element-123';
	const ATOMIC_ELEMENT_TYPE = 'e-heading';
	const WIDGET_ELEMENT_TYPE = 'widget';

	let mockShortcutsRegister: jest.Mock;
	let mockDispatchEvent: jest.SpyInstance;
	let mockGetContainer: jest.Mock;
	let mockGetBoundingClientRect: jest.Mock;
	let mockPreviewGetBoundingClientRect: jest.Mock;

	const createMockContainer = ( options: { isLocked?: boolean } = {} ) => ( {
		isLocked: jest.fn().mockReturnValue( options.isLocked ?? false ),
		model: {
			id: MOCK_ELEMENT_ID,
			toJSON: jest.fn().mockReturnValue( {
				id: MOCK_ELEMENT_ID,
				elType: ATOMIC_ELEMENT_TYPE,
				settings: {},
			} ),
		},
		view: {
			el: {
				getBoundingClientRect: mockGetBoundingClientRect,
			},
		},
	} );

	beforeEach( () => {
		jest.clearAllMocks();

		mockShortcutsRegister = jest.fn();
		mockGetContainer = jest.fn();
		mockGetBoundingClientRect = jest.fn().mockReturnValue( { left: 100, top: 200 } );
		mockPreviewGetBoundingClientRect = jest.fn().mockReturnValue( { left: 50, top: 50 } );

		( window as unknown as { $e: unknown } ).$e = {
			shortcuts: {
				register: mockShortcutsRegister,
			},
		};

		( window as unknown as { elementor: unknown } ).elementor = {
			getContainer: mockGetContainer,
			$preview: [ { getBoundingClientRect: mockPreviewGetBoundingClientRect } ],
		};

		mockDispatchEvent = jest.spyOn( window, 'dispatchEvent' );
	} );

	afterEach( () => {
		mockDispatchEvent.mockRestore();
	} );

	describe( 'CREATE_COMPONENT_SHORTCUT_KEYS', () => {
		it( 'should be ctrl+shift+k', () => {
			// Assert
			expect( CREATE_COMPONENT_SHORTCUT_KEYS ).toBe( 'ctrl+shift+k' );
		} );
	} );

	describe( 'isCreateComponentAllowed', () => {
		it( 'should return false when no element is selected', () => {
			// Arrange
			jest.mocked( getSelectedElement ).mockReturnValue( {
				element: null,
				elementType: null,
			} );

			// Act
			const result = isCreateComponentAllowed();

			// Assert
			expect( result.allowed ).toBe( false );
		} );

		it( 'should return false when Pro is not active', () => {
			// Arrange
			jest.mocked( getSelectedElement ).mockReturnValue( {
				element: { id: MOCK_ELEMENT_ID, type: ATOMIC_ELEMENT_TYPE } as Element,
				elementType: { key: ATOMIC_ELEMENT_TYPE, controls: {}, propsSchema: {} } as never,
			} );
			jest.mocked( isProActive ).mockReturnValue( false );

			// Act
			const result = isCreateComponentAllowed();

			// Assert
			expect( result.allowed ).toBe( false );
		} );

		it( 'should return false for widget element type (non-atomic)', () => {
			// Arrange
			jest.mocked( getSelectedElement ).mockReturnValue( {
				element: { id: MOCK_ELEMENT_ID, type: WIDGET_ELEMENT_TYPE } as Element,
				elementType: { key: WIDGET_ELEMENT_TYPE, controls: {}, propsSchema: {} } as never,
			} );
			jest.mocked( isProActive ).mockReturnValue( true );
			jest.mocked( getWidgetsCache ).mockReturnValue( {
				[ WIDGET_ELEMENT_TYPE ]: { elType: 'widget' },
			} );

			// Act
			const result = isCreateComponentAllowed();

			// Assert
			expect( result.allowed ).toBe( false );
		} );

		it( 'should return false when element is locked', () => {
			// Arrange
			jest.mocked( getSelectedElement ).mockReturnValue( {
				element: { id: MOCK_ELEMENT_ID, type: ATOMIC_ELEMENT_TYPE } as Element,
				elementType: { key: ATOMIC_ELEMENT_TYPE, controls: {}, propsSchema: {} } as never,
			} );
			jest.mocked( isProActive ).mockReturnValue( true );
			jest.mocked( getWidgetsCache ).mockReturnValue( {
				[ ATOMIC_ELEMENT_TYPE ]: { atomic_props_schema: {} },
			} );
			mockGetContainer.mockReturnValue( createMockContainer( { isLocked: true } ) );

			// Act
			const result = isCreateComponentAllowed();

			// Assert
			expect( result.allowed ).toBe( false );
		} );

		it( 'should return true for valid atomic element', () => {
			// Arrange
			jest.mocked( getSelectedElement ).mockReturnValue( {
				element: { id: MOCK_ELEMENT_ID, type: ATOMIC_ELEMENT_TYPE } as Element,
				elementType: { key: ATOMIC_ELEMENT_TYPE, controls: {}, propsSchema: {} } as never,
			} );
			jest.mocked( isProActive ).mockReturnValue( true );
			jest.mocked( getWidgetsCache ).mockReturnValue( {
				[ ATOMIC_ELEMENT_TYPE ]: { atomic_props_schema: {} },
			} );
			mockGetContainer.mockReturnValue( createMockContainer() );

			// Act
			const result = isCreateComponentAllowed();

			// Assert
			expect( result.allowed ).toBe( true );
			expect( result.container ).toBeDefined();
		} );
	} );

	describe( 'triggerCreateComponentForm', () => {
		it( 'should dispatch open-save-as-component-form event with correct data', () => {
			// Arrange
			const mockContainer = createMockContainer();

			// Act
			triggerCreateComponentForm( mockContainer as never );

			// Assert
			expect( mockDispatchEvent ).toHaveBeenCalledWith(
				expect.objectContaining( {
					type: 'elementor/editor/open-save-as-component-form',
				} )
			);

			const dispatchedEvent = mockDispatchEvent.mock.calls[ 0 ][ 0 ] as CustomEvent;
			expect( dispatchedEvent.detail ).toEqual( {
				element: expect.objectContaining( { id: MOCK_ELEMENT_ID } ),
				anchorPosition: { left: 150, top: 250 },
				options: {
					trigger: 'keyboard',
					location: 'canvas',
					secondaryLocation: 'canvasElement',
				},
			} );
		} );
	} );

	describe( 'initCreateComponentShortcut', () => {
		it( 'should register shortcut with correct keys', () => {
			// Act
			initCreateComponentShortcut();

			// Assert
			expect( mockShortcutsRegister ).toHaveBeenCalledWith(
				CREATE_COMPONENT_SHORTCUT_KEYS,
				expect.objectContaining( {
					exclude: [ 'input' ],
				} )
			);
		} );

		it( 'should register shortcut with dependency function', () => {
			// Act
			initCreateComponentShortcut();

			// Assert
			const registeredConfig = mockShortcutsRegister.mock.calls[ 0 ][ 1 ];
			expect( typeof registeredConfig.dependency ).toBe( 'function' );
		} );

		it( 'should register shortcut with callback function', () => {
			// Act
			initCreateComponentShortcut();

			// Assert
			const registeredConfig = mockShortcutsRegister.mock.calls[ 0 ][ 1 ];
			expect( typeof registeredConfig.callback ).toBe( 'function' );
		} );

		it( 'should trigger form when callback is invoked with valid element', () => {
			// Arrange
			jest.mocked( getSelectedElement ).mockReturnValue( {
				element: { id: MOCK_ELEMENT_ID, type: ATOMIC_ELEMENT_TYPE } as Element,
				elementType: { key: ATOMIC_ELEMENT_TYPE, controls: {}, propsSchema: {} } as never,
			} );
			jest.mocked( isProActive ).mockReturnValue( true );
			jest.mocked( getWidgetsCache ).mockReturnValue( {
				[ ATOMIC_ELEMENT_TYPE ]: { atomic_props_schema: {} },
			} );
			mockGetContainer.mockReturnValue( createMockContainer() );

			initCreateComponentShortcut();
			const registeredConfig = mockShortcutsRegister.mock.calls[ 0 ][ 1 ];

			// Act
			registeredConfig.callback();

			// Assert
			expect( mockDispatchEvent ).toHaveBeenCalledWith(
				expect.objectContaining( {
					type: 'elementor/editor/open-save-as-component-form',
				} )
			);
		} );

		it( 'should not trigger form when callback is invoked with invalid element', () => {
			// Arrange
			jest.mocked( getSelectedElement ).mockReturnValue( {
				element: null,
				elementType: null,
			} );

			initCreateComponentShortcut();
			const registeredConfig = mockShortcutsRegister.mock.calls[ 0 ][ 1 ];

			// Act
			registeredConfig.callback();

			// Assert
			expect( mockDispatchEvent ).not.toHaveBeenCalled();
		} );
	} );
} );
