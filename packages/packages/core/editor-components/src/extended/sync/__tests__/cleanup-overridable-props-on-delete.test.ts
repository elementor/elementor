import { createHooksRegistry, createMockElement, setupHooksRegistry, type WindowWithHooks } from 'test-utils';
import { getAllDescendants, type V1Element } from '@elementor/editor-elements';
import { __getState as getState, __getStore as getStore } from '@elementor/store';

import { SLICE_NAME } from '../../../store/store';
import type { OverridableProps, PublishedComponent } from '../../../types';
import { deleteOverridableProp } from '../../store/actions/delete-overridable-prop';
import { initCleanupOverridablePropsOnDelete } from '../cleanup-overridable-props-on-delete';

jest.mock( '@elementor/store', () => ( {
	...jest.requireActual( '@elementor/store' ),
	__getState: jest.fn(),
	__getStore: jest.fn(),
	__dispatch: jest.fn(),
} ) );

jest.mock( '@elementor/editor-elements', () => ( {
	...jest.requireActual( '@elementor/editor-elements' ),
	getContainer: jest.fn(),
	getAllDescendants: jest.fn(),
} ) );

jest.mock( '../../store/actions/delete-overridable-prop', () => ( {
	deleteOverridableProp: jest.fn(),
} ) );

describe( 'initCleanupOverridablePropsOnDelete', () => {
	const MOCK_COMPONENT_ID = 123;
	const ELEMENT_ID_1 = 'element-1';
	const ELEMENT_ID_2 = 'element-2';
	const CHILD_ELEMENT_ID = 'child-element';
	const PROP_KEY_1 = 'prop-1';
	const PROP_KEY_2 = 'prop-2';
	const PROP_KEY_CHILD = 'prop-child';
	const GROUP_ID = 'group-1';

	const hooksRegistry = createHooksRegistry();

	let mockState: { data: PublishedComponent[]; currentComponentId: number | null };

	const createMockOverridableProps = (): OverridableProps => ( {
		props: {
			[ PROP_KEY_1 ]: {
				overrideKey: PROP_KEY_1,
				label: 'Test Prop',
				elementId: ELEMENT_ID_1,
				propKey: 'text',
				elType: 'widget',
				widgetType: 'e-heading',
				originValue: { $$type: 'string', value: 'Hello' },
				groupId: GROUP_ID,
			},
		},
		groups: {
			items: {
				[ GROUP_ID ]: {
					id: GROUP_ID,
					label: 'Test Group',
					props: [ PROP_KEY_1 ],
				},
			},
			order: [ GROUP_ID ],
		},
	} );

	const createMockOverridablePropsWithMultipleElements = (): OverridableProps => ( {
		props: {
			[ PROP_KEY_1 ]: {
				overrideKey: PROP_KEY_1,
				label: 'Test Prop 1',
				elementId: ELEMENT_ID_1,
				propKey: 'text',
				elType: 'widget',
				widgetType: 'e-heading',
				originValue: { $$type: 'string', value: 'Hello 1' },
				groupId: GROUP_ID,
			},
			[ PROP_KEY_2 ]: {
				overrideKey: PROP_KEY_2,
				label: 'Test Prop 2',
				elementId: ELEMENT_ID_2,
				propKey: 'title',
				elType: 'widget',
				widgetType: 'e-button',
				originValue: { $$type: 'string', value: 'Hello 2' },
				groupId: GROUP_ID,
			},
		},
		groups: {
			items: {
				[ GROUP_ID ]: {
					id: GROUP_ID,
					label: 'Test Group',
					props: [ PROP_KEY_1, PROP_KEY_2 ],
				},
			},
			order: [ GROUP_ID ],
		},
	} );

	const createMockOverridablePropsWithChild = (): OverridableProps => ( {
		props: {
			[ PROP_KEY_1 ]: {
				overrideKey: PROP_KEY_1,
				label: 'Test Prop 1',
				elementId: ELEMENT_ID_1,
				propKey: 'text',
				elType: 'widget',
				widgetType: 'e-heading',
				originValue: { $$type: 'string', value: 'Hello 1' },
				groupId: GROUP_ID,
			},
			[ PROP_KEY_CHILD ]: {
				overrideKey: PROP_KEY_CHILD,
				label: 'Child Prop',
				elementId: CHILD_ELEMENT_ID,
				propKey: 'content',
				elType: 'widget',
				widgetType: 'e-text',
				originValue: { $$type: 'string', value: 'Child content' },
				groupId: GROUP_ID,
			},
		},
		groups: {
			items: {
				[ GROUP_ID ]: {
					id: GROUP_ID,
					label: 'Test Group',
					props: [ PROP_KEY_1, PROP_KEY_CHILD ],
				},
			},
			order: [ GROUP_ID ],
		},
	} );

	let originalWindow: WindowWithHooks;

	beforeEach( () => {
		jest.clearAllMocks();
		setupHooksRegistry( hooksRegistry );
		originalWindow = { ...( window as unknown as WindowWithHooks ) };

		mockState = {
			data: [
				{
					id: MOCK_COMPONENT_ID,
					uid: 'comp-uid',
					name: 'Test Component',
					overridableProps: createMockOverridableProps(),
				},
			],
			currentComponentId: MOCK_COMPONENT_ID,
		};

		const stateGetter = () => ( { [ SLICE_NAME ]: mockState } );

		jest.mocked( getState ).mockImplementation( stateGetter );
		jest.mocked( getStore ).mockImplementation( () => ( { getState: stateGetter, dispatch: jest.fn() } ) as never );

		jest.mocked( getAllDescendants ).mockReturnValue( [] );
		jest.mocked( deleteOverridableProp ).mockReturnValue( undefined );
	} );

	afterEach( () => {
		( window as unknown as WindowWithHooks ) = originalWindow;
	} );

	it( 'should register a hook for document/elements/delete command', () => {
		// Arrange - done in beforeEach

		// Act
		initCleanupOverridablePropsOnDelete();

		// Assert
		const registeredHooks = hooksRegistry.getAll();
		expect( registeredHooks.length ).toBe( 1 );
		expect( registeredHooks[ 0 ].getCommand() ).toBe( 'document/elements/delete' );
	} );

	it( 'should call deleteOverridableProp with prop removed when element is deleted', () => {
		// Arrange
		initCleanupOverridablePropsOnDelete();
		const registeredHooks = hooksRegistry.getAll();
		const hook = registeredHooks[ 0 ];

		const deletedElement = createMockElement( {
			model: { id: ELEMENT_ID_1 },
		} );

		// Act
		hook.apply( { container: deletedElement }, deletedElement );

		// Assert
		expect( deleteOverridableProp ).toHaveBeenCalledWith( {
			componentId: MOCK_COMPONENT_ID,
			propKey: [ PROP_KEY_1 ],
			source: 'system',
		} );
	} );

	it( 'should remove multiple props when deleting multiple elements', () => {
		// Arrange
		mockState.data[ 0 ].overridableProps = createMockOverridablePropsWithMultipleElements();
		initCleanupOverridablePropsOnDelete();
		const registeredHooks = hooksRegistry.getAll();
		const hook = registeredHooks[ 0 ];

		const deletedElement1 = createMockElement( { model: { id: ELEMENT_ID_1 } } );
		const deletedElement2 = createMockElement( { model: { id: ELEMENT_ID_2 } } );

		// Act
		hook.apply( { containers: [ deletedElement1, deletedElement2 ] }, [ deletedElement1, deletedElement2 ] );

		// Assert
		expect( deleteOverridableProp ).toHaveBeenCalledWith( {
			componentId: MOCK_COMPONENT_ID,
			propKey: [ PROP_KEY_1, PROP_KEY_2 ],
			source: 'system',
		} );
	} );

	it( 'should remove props for parent and descendant elements', () => {
		// Arrange
		mockState.data[ 0 ].overridableProps = createMockOverridablePropsWithChild();
		initCleanupOverridablePropsOnDelete();
		const registeredHooks = hooksRegistry.getAll();
		const hook = registeredHooks[ 0 ];

		const childElement = createMockElement( { model: { id: CHILD_ELEMENT_ID } } );
		const parentElement = createMockElement( {
			model: { id: ELEMENT_ID_1 },
			children: [ childElement ],
		} );

		jest.mocked( getAllDescendants ).mockReturnValue( [ childElement ] as V1Element[] );

		// Act
		hook.apply( { container: parentElement }, parentElement );

		// Assert
		expect( deleteOverridableProp ).toHaveBeenCalledWith( {
			componentId: MOCK_COMPONENT_ID,
			propKey: [ PROP_KEY_1, PROP_KEY_CHILD ],
			source: 'system',
		} );
	} );

	it( 'should only remove props for matching elements', () => {
		// Arrange
		mockState.data[ 0 ].overridableProps = createMockOverridablePropsWithMultipleElements();
		initCleanupOverridablePropsOnDelete();
		const registeredHooks = hooksRegistry.getAll();
		const hook = registeredHooks[ 0 ];

		const deletedElement1 = createMockElement( { model: { id: ELEMENT_ID_1 } } );

		// Act
		hook.apply( { container: deletedElement1 }, deletedElement1 );

		// Assert
		expect( deleteOverridableProp ).toHaveBeenCalledWith( {
			componentId: MOCK_COMPONENT_ID,
			propKey: [ PROP_KEY_1 ],
			source: 'system',
		} );
	} );

	it( 'should not call deleteOverridableProp when no matching elements', () => {
		// Arrange
		initCleanupOverridablePropsOnDelete();
		const registeredHooks = hooksRegistry.getAll();
		const hook = registeredHooks[ 0 ];

		const deletedElement = createMockElement( { model: { id: 'non-matching-element' } } );

		// Act
		hook.apply( { container: deletedElement }, deletedElement );

		// Assert
		expect( deleteOverridableProp ).not.toHaveBeenCalled();
	} );

	it( 'should not call deleteOverridableProp when component has no overridable props', () => {
		// Arrange
		mockState.data[ 0 ].overridableProps = { props: {}, groups: { items: {}, order: [] } };
		initCleanupOverridablePropsOnDelete();
		const registeredHooks = hooksRegistry.getAll();
		const hook = registeredHooks[ 0 ];

		const deletedElement = createMockElement( { model: { id: ELEMENT_ID_1 } } );

		// Act
		hook.apply( { container: deletedElement }, deletedElement );

		// Assert
		expect( deleteOverridableProp ).not.toHaveBeenCalled();
	} );

	it( 'should not call deleteOverridableProp when not editing a component', () => {
		// Arrange
		mockState.currentComponentId = null;
		initCleanupOverridablePropsOnDelete();
		const registeredHooks = hooksRegistry.getAll();
		const hook = registeredHooks[ 0 ];

		const deletedElement = createMockElement( { model: { id: ELEMENT_ID_1 } } );

		// Act
		hook.apply( { container: deletedElement }, deletedElement );

		// Assert
		expect( deleteOverridableProp ).not.toHaveBeenCalled();
	} );

	it( 'should not call deleteOverridableProp when container is null', () => {
		// Arrange
		initCleanupOverridablePropsOnDelete();
		const registeredHooks = hooksRegistry.getAll();
		const hook = registeredHooks[ 0 ];

		// Act
		hook.apply( { container: null }, null );

		// Assert
		expect( deleteOverridableProp ).not.toHaveBeenCalled();
	} );

	it( 'should not call deleteOverridableProp when part of move command', () => {
		// Arrange
		initCleanupOverridablePropsOnDelete();
		const registeredHooks = hooksRegistry.getAll();
		const hook = registeredHooks[ 0 ];

		( window as unknown as WindowWithHooks ).$e.commands = {
			currentTrace: [ 'document/elements/move' ],
		};

		const deletedElement = createMockElement( { model: { id: ELEMENT_ID_1 } } );

		// Act
		hook.apply( { container: deletedElement }, { commandsCurrentTrace: [ 'document/elements/move' ] } );

		// Assert
		expect( deleteOverridableProp ).not.toHaveBeenCalled();
	} );
} );
