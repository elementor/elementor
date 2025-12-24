import * as React from 'react';
import { renderWithStore } from 'test-utils';
import {
	__createStore,
	__dispatch as dispatch,
	__getState as getState,
	__registerSlice,
	type Store,
} from '@elementor/store';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { type ComponentsSlice, selectOverridableProps, slice } from '../../../store/store';

jest.mock( '@elementor/editor-documents', () => ( {
	setDocumentModifiedStatus: jest.fn(),
} ) );
import { type OverridableProps, type PublishedComponent } from '../../../types';
import { ComponentPropertiesPanelContent as ComponentPropertiesPanel } from '../component-properties-panel-content';

const MOCK_COMPONENT_ID = 123;
const MOCK_GROUP_ID = 'group-1';
const MOCK_GROUP_LABEL = 'Content';
const MOCK_PROP_KEY = 'prop-1';
const MOCK_PROP_LABEL = 'Heading Text';

const createMockComponent = ( overridableProps: OverridableProps ): PublishedComponent => ( {
	id: MOCK_COMPONENT_ID,
	uid: `component-${ MOCK_COMPONENT_ID }`,
	name: 'Test Component',
	overridableProps,
} );

const createMockOverridableProps = (): OverridableProps => ( {
	props: {
		[ MOCK_PROP_KEY ]: {
			overrideKey: MOCK_PROP_KEY,
			label: MOCK_PROP_LABEL,
			elementId: 'element-1',
			propKey: 'text',
			elType: 'widget',
			widgetType: 'e-heading',
			originValue: { $$type: 'string', value: 'Hello' },
			groupId: MOCK_GROUP_ID,
		},
	},
	groups: {
		items: {
			[ MOCK_GROUP_ID ]: {
				id: MOCK_GROUP_ID,
				label: MOCK_GROUP_LABEL,
				props: [ MOCK_PROP_KEY ],
			},
		},
		order: [ MOCK_GROUP_ID ],
	},
} );

describe( 'ComponentPropertiesPanel', () => {
	let store: Store< ComponentsSlice >;
	const mockOnClose = jest.fn();

	beforeEach( () => {
		__registerSlice( slice );
		store = __createStore();
		jest.clearAllMocks();
	} );

	afterEach( () => {
		jest.resetAllMocks();
	} );

	describe( 'rendering', () => {
		it( 'should render panel with groups and properties', () => {
			// Arrange
			const overridableProps = createMockOverridableProps();
			dispatch( slice.actions.load( [ createMockComponent( overridableProps ) ] ) );
			dispatch( slice.actions.setCurrentComponentId( MOCK_COMPONENT_ID ) );

			// Act
			renderWithStore( <ComponentPropertiesPanel onClose={ mockOnClose } />, store );

			// Assert
			expect( screen.getByText( 'Component properties' ) ).toBeInTheDocument();
			expect( screen.getByText( MOCK_GROUP_LABEL ) ).toBeInTheDocument();
			expect( screen.getByText( MOCK_PROP_LABEL ) ).toBeInTheDocument();
		} );

		it( 'should not render when no component is selected', () => {
			// Arrange
			dispatch( slice.actions.setCurrentComponentId( null ) );

			// Act
			const { container } = renderWithStore( <ComponentPropertiesPanel onClose={ mockOnClose } />, store );

			// Assert
			expect( container ).toBeEmptyDOMElement();
		} );

		it( 'should render add group button in header', () => {
			// Arrange
			const overridableProps = createMockOverridableProps();
			dispatch( slice.actions.load( [ createMockComponent( overridableProps ) ] ) );
			dispatch( slice.actions.setCurrentComponentId( MOCK_COMPONENT_ID ) );

			// Act
			renderWithStore( <ComponentPropertiesPanel onClose={ mockOnClose } />, store );

			// Assert
			expect( screen.getByLabelText( 'Add new group' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'empty state', () => {
		it( 'should render empty state when no properties exist', () => {
			// Arrange
			const emptyOverridableProps: OverridableProps = {
				props: {},
				groups: {
					items: {},
					order: [],
				},
			};
			dispatch( slice.actions.load( [ createMockComponent( emptyOverridableProps ) ] ) );
			dispatch( slice.actions.setCurrentComponentId( MOCK_COMPONENT_ID ) );

			// Act
			renderWithStore( <ComponentPropertiesPanel onClose={ mockOnClose } />, store );

			// Assert
			expect( screen.getByText( 'Add your first property' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Make instances flexible while keeping design synced.' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Learn more' ) ).toBeInTheDocument();
		} );

		it( 'should hide add group button when empty state is shown', () => {
			// Arrange
			const emptyOverridableProps: OverridableProps = {
				props: {},
				groups: {
					items: {},
					order: [],
				},
			};
			dispatch( slice.actions.load( [ createMockComponent( emptyOverridableProps ) ] ) );
			dispatch( slice.actions.setCurrentComponentId( MOCK_COMPONENT_ID ) );

			// Act
			renderWithStore( <ComponentPropertiesPanel onClose={ mockOnClose } />, store );

			// Assert
			expect( screen.queryByLabelText( 'Add new group' ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'add group', () => {
		it( 'should show editable input when add group button is clicked', async () => {
			// Arrange
			const overridableProps = createMockOverridableProps();
			dispatch( slice.actions.load( [ createMockComponent( overridableProps ) ] ) );
			dispatch( slice.actions.setCurrentComponentId( MOCK_COMPONENT_ID ) );
			renderWithStore( <ComponentPropertiesPanel onClose={ mockOnClose } />, store );

			// Act
			fireEvent.click( screen.getByLabelText( 'Add new group' ) );

			// Assert
			await waitFor( () => {
				const editableField = screen.getByRole( 'textbox' );
				expect( editableField ).toBeInTheDocument();
			} );
		} );

		it( 'should create new group when editable input is submitted via blur', async () => {
			// Arrange
			const overridableProps = createMockOverridableProps();
			dispatch( slice.actions.load( [ createMockComponent( overridableProps ) ] ) );
			dispatch( slice.actions.setCurrentComponentId( MOCK_COMPONENT_ID ) );
			renderWithStore( <ComponentPropertiesPanel onClose={ mockOnClose } />, store );

			// Act
			fireEvent.click( screen.getByLabelText( 'Add new group' ) );
			const input = await screen.findByRole( 'textbox' );

			fireEvent.input( input, { target: { innerText: 'New Section' } } );
			fireEvent.blur( input );

			// Assert
			await waitFor( () => {
				const state = getState();
				const updatedProps = selectOverridableProps( state, MOCK_COMPONENT_ID );
				const groupLabels = Object.values( updatedProps?.groups.items ?? {} ).map( ( g ) => g.label );
				expect( groupLabels ).toContain( 'New Section' );
			} );
		} );

		it( 'should add new group at the top of the order', async () => {
			// Arrange
			const overridableProps = createMockOverridableProps();
			dispatch( slice.actions.load( [ createMockComponent( overridableProps ) ] ) );
			dispatch( slice.actions.setCurrentComponentId( MOCK_COMPONENT_ID ) );
			renderWithStore( <ComponentPropertiesPanel onClose={ mockOnClose } />, store );

			// Act
			fireEvent.click( screen.getByLabelText( 'Add new group' ) );
			const input = await screen.findByRole( 'textbox' );

			fireEvent.input( input, { target: { innerText: 'First Group' } } );
			fireEvent.blur( input );

			// Assert
			await waitFor( () => {
				const state = getState();
				const updatedProps = selectOverridableProps( state, MOCK_COMPONENT_ID );
				const firstGroupId = updatedProps?.groups.order[ 0 ];
				const firstGroup = updatedProps?.groups.items[ firstGroupId ?? '' ];
				expect( firstGroup?.label ).toBe( 'First Group' );
			} );
		} );
	} );

	describe( 'delete property', () => {
		it( 'should remove property when X button is clicked', async () => {
			// Arrange
			const overridableProps = createMockOverridableProps();
			dispatch( slice.actions.load( [ createMockComponent( overridableProps ) ] ) );
			dispatch( slice.actions.setCurrentComponentId( MOCK_COMPONENT_ID ) );
			renderWithStore( <ComponentPropertiesPanel onClose={ mockOnClose } />, store );

			// Act
			fireEvent.click( screen.getByLabelText( 'Delete property' ) );

			// Assert
			await waitFor( () => {
				const state = getState();
				const updatedProps = selectOverridableProps( state, MOCK_COMPONENT_ID );
				expect( updatedProps?.props[ MOCK_PROP_KEY ] ).toBeUndefined();
			} );
		} );

		it( 'should remove property from group props array', async () => {
			// Arrange
			const overridableProps = createMockOverridableProps();
			dispatch( slice.actions.load( [ createMockComponent( overridableProps ) ] ) );
			dispatch( slice.actions.setCurrentComponentId( MOCK_COMPONENT_ID ) );
			renderWithStore( <ComponentPropertiesPanel onClose={ mockOnClose } />, store );

			// Act
			fireEvent.click( screen.getByLabelText( 'Delete property' ) );

			// Assert
			await waitFor( () => {
				const state = getState();
				const updatedProps = selectOverridableProps( state, MOCK_COMPONENT_ID );
				const group = updatedProps?.groups.items[ MOCK_GROUP_ID ];
				expect( group?.props ).not.toContain( MOCK_PROP_KEY );
			} );
		} );
	} );

	describe( 'rename property', () => {
		it( 'should open popover when property is clicked', () => {
			// Arrange
			const overridableProps = createMockOverridableProps();
			dispatch( slice.actions.load( [ createMockComponent( overridableProps ) ] ) );
			dispatch( slice.actions.setCurrentComponentId( MOCK_COMPONENT_ID ) );
			renderWithStore( <ComponentPropertiesPanel onClose={ mockOnClose } />, store );

			// Act
			fireEvent.click( screen.getByText( MOCK_PROP_LABEL ) );

			// Assert
			expect( screen.getByText( 'Update property' ) ).toBeInTheDocument();
		} );

		it( 'should update property label when form is submitted', async () => {
			// Arrange
			const overridableProps = createMockOverridableProps();
			dispatch( slice.actions.load( [ createMockComponent( overridableProps ) ] ) );
			dispatch( slice.actions.setCurrentComponentId( MOCK_COMPONENT_ID ) );
			renderWithStore( <ComponentPropertiesPanel onClose={ mockOnClose } />, store );

			// Act
			fireEvent.click( screen.getByText( MOCK_PROP_LABEL ) );
			const nameInput = screen.getByPlaceholderText( 'Enter value' );
			fireEvent.change( nameInput, { target: { value: 'Updated Label' } } );
			fireEvent.click( screen.getByRole( 'button', { name: 'Update' } ) );

			// Assert
			await waitFor( () => {
				const state = getState();
				const updatedProps = selectOverridableProps( state, MOCK_COMPONENT_ID );
				expect( updatedProps?.props[ MOCK_PROP_KEY ]?.label ).toBe( 'Updated Label' );
			} );
		} );
	} );

	describe( 'close panel', () => {
		it( 'should call onClose when close button is clicked', () => {
			// Arrange
			const overridableProps = createMockOverridableProps();
			dispatch( slice.actions.load( [ createMockComponent( overridableProps ) ] ) );
			dispatch( slice.actions.setCurrentComponentId( MOCK_COMPONENT_ID ) );
			renderWithStore( <ComponentPropertiesPanel onClose={ mockOnClose } />, store );

			// Act
			fireEvent.click( screen.getByLabelText( 'Close panel' ) );

			// Assert
			expect( mockOnClose ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'group menu', () => {
		it( 'should render menu button for each group', () => {
			// Arrange
			const overridableProps = createMockOverridableProps();
			dispatch( slice.actions.load( [ createMockComponent( overridableProps ) ] ) );
			dispatch( slice.actions.setCurrentComponentId( MOCK_COMPONENT_ID ) );

			// Act
			renderWithStore( <ComponentPropertiesPanel onClose={ mockOnClose } />, store );

			// Assert
			expect( screen.getByLabelText( 'Group actions' ) ).toBeInTheDocument();
		} );

		it( 'should open menu with Rename and Delete options when menu button is clicked', async () => {
			// Arrange
			const overridableProps = createMockOverridableProps();
			dispatch( slice.actions.load( [ createMockComponent( overridableProps ) ] ) );
			dispatch( slice.actions.setCurrentComponentId( MOCK_COMPONENT_ID ) );
			renderWithStore( <ComponentPropertiesPanel onClose={ mockOnClose } />, store );

			// Act
			fireEvent.click( screen.getByLabelText( 'Group actions' ) );

			// Assert
			await waitFor( () => {
				expect( screen.getByText( 'Rename' ) ).toBeInTheDocument();
				expect( screen.getByText( 'Delete' ) ).toBeInTheDocument();
			} );
		} );
	} );

	describe( 'delete group', () => {
		it( 'should disable delete when group has properties', async () => {
			// Arrange
			const overridableProps = createMockOverridableProps();
			dispatch( slice.actions.load( [ createMockComponent( overridableProps ) ] ) );
			dispatch( slice.actions.setCurrentComponentId( MOCK_COMPONENT_ID ) );
			renderWithStore( <ComponentPropertiesPanel onClose={ mockOnClose } />, store );

			// Act
			fireEvent.click( screen.getByLabelText( 'Group actions' ) );

			// Assert
			await waitFor( () => {
				const deleteMenuItem = screen.getByRole( 'menuitem', { name: 'Delete' } );
				expect( deleteMenuItem ).toHaveAttribute( 'aria-disabled', 'true' );
			} );
		} );

		it( 'should delete empty group immediately', async () => {
			// Arrange
			const EMPTY_GROUP_ID = 'empty-group';
			const EMPTY_GROUP_LABEL = 'Empty Group';
			const overridableProps: OverridableProps = {
				...createMockOverridableProps(),
				groups: {
					items: {
						...createMockOverridableProps().groups.items,
						[ EMPTY_GROUP_ID ]: {
							id: EMPTY_GROUP_ID,
							label: EMPTY_GROUP_LABEL,
							props: [],
						},
					},
					order: [ MOCK_GROUP_ID, EMPTY_GROUP_ID ],
				},
			};
			dispatch( slice.actions.load( [ createMockComponent( overridableProps ) ] ) );
			dispatch( slice.actions.setCurrentComponentId( MOCK_COMPONENT_ID ) );
			renderWithStore( <ComponentPropertiesPanel onClose={ mockOnClose } />, store );

			// Act
			const menuButtons = screen.getAllByLabelText( 'Group actions' );
			fireEvent.click( menuButtons[ 1 ] );
			await waitFor( () => {
				expect( screen.getByText( 'Delete' ) ).toBeInTheDocument();
			} );
			fireEvent.click( screen.getByText( 'Delete' ) );

			// Assert
			await waitFor( () => {
				const state = getState();
				const updatedProps = selectOverridableProps( state, MOCK_COMPONENT_ID );
				expect( updatedProps?.groups.items[ EMPTY_GROUP_ID ] ).toBeUndefined();
				expect( updatedProps?.groups.order ).not.toContain( EMPTY_GROUP_ID );
			} );
		} );
	} );

	describe( 'rename group', () => {
		it( 'should make group label editable when Rename is clicked', async () => {
			// Arrange
			const overridableProps = createMockOverridableProps();
			dispatch( slice.actions.load( [ createMockComponent( overridableProps ) ] ) );
			dispatch( slice.actions.setCurrentComponentId( MOCK_COMPONENT_ID ) );
			renderWithStore( <ComponentPropertiesPanel onClose={ mockOnClose } />, store );

			// Act
			fireEvent.click( screen.getByLabelText( 'Group actions' ) );
			await waitFor( () => {
				expect( screen.getByText( 'Rename' ) ).toBeInTheDocument();
			} );
			fireEvent.click( screen.getByText( 'Rename' ) );

			// Assert
			const editableField = await screen.findByRole( 'textbox' );
			expect( editableField ).toBeInTheDocument();
			expect( editableField ).toHaveAttribute( 'contenteditable', 'true' );
		} );

		it( 'should update group label on blur', async () => {
			// Arrange
			const overridableProps = createMockOverridableProps();
			dispatch( slice.actions.load( [ createMockComponent( overridableProps ) ] ) );
			dispatch( slice.actions.setCurrentComponentId( MOCK_COMPONENT_ID ) );
			renderWithStore( <ComponentPropertiesPanel onClose={ mockOnClose } />, store );

			// Act
			fireEvent.click( screen.getByLabelText( 'Group actions' ) );
			await waitFor( () => {
				expect( screen.getByText( 'Rename' ) ).toBeInTheDocument();
			} );
			fireEvent.click( screen.getByText( 'Rename' ) );

			const input = await screen.findByRole( 'textbox' );
			fireEvent.input( input, { target: { innerText: 'Renamed Group' } } );
			fireEvent.blur( input );

			// Assert
			await waitFor( () => {
				const state = getState();
				const updatedProps = selectOverridableProps( state, MOCK_COMPONENT_ID );
				expect( updatedProps?.groups.items[ MOCK_GROUP_ID ]?.label ).toBe( 'Renamed Group' );
			} );
		} );

		it( 'should not allow renaming to empty string', async () => {
			// Arrange
			const overridableProps = createMockOverridableProps();
			dispatch( slice.actions.load( [ createMockComponent( overridableProps ) ] ) );
			dispatch( slice.actions.setCurrentComponentId( MOCK_COMPONENT_ID ) );
			renderWithStore( <ComponentPropertiesPanel onClose={ mockOnClose } />, store );

			// Act
			fireEvent.click( screen.getByLabelText( 'Group actions' ) );
			await waitFor( () => {
				expect( screen.getByText( 'Rename' ) ).toBeInTheDocument();
			} );
			fireEvent.click( screen.getByText( 'Rename' ) );

			const input = await screen.findByRole( 'textbox' );
			fireEvent.input( input, { target: { innerText: '' } } );
			fireEvent.blur( input );

			// Assert
			await waitFor( () => {
				const state = getState();
				const updatedProps = selectOverridableProps( state, MOCK_COMPONENT_ID );
				expect( updatedProps?.groups.items[ MOCK_GROUP_ID ]?.label ).toBe( MOCK_GROUP_LABEL );
			} );
		} );
	} );
} );
