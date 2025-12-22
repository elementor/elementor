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
import { ComponentPropertiesPanel } from '../component-properties-panel-content';

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
} );
