import * as React from 'react';
import { renderWithStore } from 'test-utils';
import { __createStore, __dispatch as dispatch, __registerSlice, type Store } from '@elementor/store';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { ErrorBoundary } from '@elementor/ui';

import { type ComponentsSlice, slice } from '../../../../store/store';
import { type OverridableProps, type PublishedComponent } from '../../../../types';
import { useCurrentEditableItem } from '../use-current-editable-item';

jest.mock( '@elementor/editor-documents', () => ( {
	setDocumentModifiedStatus: jest.fn(),
} ) );

const MOCK_COMPONENT_ID = 123;
const MOCK_GROUP_ID = 'group-1';
const MOCK_GROUP_LABEL = 'Content';

const createMockComponent = ( overridableProps: OverridableProps ): PublishedComponent => ( {
	id: MOCK_COMPONENT_ID,
	uid: `component-${ MOCK_COMPONENT_ID }`,
	name: 'Test Component',
	overridableProps,
} );

const createMockOverridableProps = (): OverridableProps => ( {
	props: {},
	groups: {
		items: {
			[ MOCK_GROUP_ID ]: {
				id: MOCK_GROUP_ID,
				label: MOCK_GROUP_LABEL,
				props: [],
			},
		},
		order: [ MOCK_GROUP_ID ],
	},
} );

const TestComponent = ( { triggerSubmitWithoutGroup = false }: { triggerSubmitWithoutGroup?: boolean } ) => {
	const { editableRef, isEditing, error, getEditableProps, setEditingGroupId, editingGroupId } =
		useCurrentEditableItem();

	const handleForceSubmit = () => {
		const props = getEditableProps();
		if ( props.value !== undefined ) {
			fireEvent.blur( editableRef.current as HTMLElement );
		}
	};

	return (
		<div>
			<button onClick={ () => setEditingGroupId( MOCK_GROUP_ID ) } data-testid="start-editing">
				Start Editing
			</button>
			{ triggerSubmitWithoutGroup && (
				<button onClick={ handleForceSubmit } data-testid="force-submit">
					Force Submit
				</button>
			) }
			<div
				ref={ editableRef as React.RefObject< HTMLDivElement > }
				{ ...getEditableProps() }
				role="textbox"
				contentEditable={ isEditing }
				data-testid="editable-field"
			/>
			<div data-testid="editing-state">{ isEditing ? 'editing' : 'not-editing' }</div>
			<div data-testid="error-state">{ error || 'no-error' }</div>
			<div data-testid="editing-group-id">{ editingGroupId || 'null' }</div>
		</div>
	);
};

describe( 'useCurrentEditableItem', () => {
	let store: Store< ComponentsSlice >;

	beforeEach( () => {
		__registerSlice( slice );
		store = __createStore();
		jest.clearAllMocks();
	} );

	afterEach( () => {
		jest.resetAllMocks();
	} );

	describe( 'handleSubmit error handling', () => {
		it( 'should not throw when starting edit mode without component ID', () => {
			// Arrange
			const overridableProps = createMockOverridableProps();
			dispatch( slice.actions.load( [ createMockComponent( overridableProps ) ] ) );
			dispatch( slice.actions.setCurrentComponentId( null ) );

			// Act & Assert
			expect( () => {
				renderWithStore( <TestComponent />, store );
				const startEditingButton = screen.getByTestId( 'start-editing' );
				fireEvent.click( startEditingButton );
			} ).not.toThrow();
		} );

		it( 'should throw error when component ID is missing during rename submission', async () => {
			// Arrange
			const overridableProps = createMockOverridableProps();
			dispatch( slice.actions.load( [ createMockComponent( overridableProps ) ] ) );
			dispatch( slice.actions.setCurrentComponentId( null ) );

			const ErrorFallback = () => <div data-testid="error-fallback">Error occurred</div>;
			renderWithStore(
				<ErrorBoundary fallback={ <ErrorFallback /> }>
					<TestComponent />
				</ErrorBoundary>,
				store
			);

			// Act
			const startEditingButton = screen.getByTestId( 'start-editing' );
			fireEvent.click( startEditingButton );

			await waitFor( () => {
				expect( screen.getByTestId( 'editing-state' ) ).toHaveTextContent( 'editing' );
			} );

			const editableField = screen.getByTestId( 'editable-field' );
			fireEvent.input( editableField, { target: { innerText: 'New Label' } } );
			fireEvent.blur( editableField );

			// Assert
			await waitFor( () => {
				expect( screen.getByTestId( 'error-fallback' ) ).toBeInTheDocument();
			} );
		} );

		it( 'should successfully rename when both group ID and component ID are present', async () => {
			// Arrange
			const overridableProps = createMockOverridableProps();
			dispatch( slice.actions.load( [ createMockComponent( overridableProps ) ] ) );
			dispatch( slice.actions.setCurrentComponentId( MOCK_COMPONENT_ID ) );
			renderWithStore( <TestComponent />, store );

			// Act
			const startEditingButton = screen.getByTestId( 'start-editing' );
			fireEvent.click( startEditingButton );

			await waitFor( () => {
				expect( screen.getByTestId( 'editing-group-id' ) ).toHaveTextContent( MOCK_GROUP_ID );
			} );

			const editableField = screen.getByTestId( 'editable-field' );
			fireEvent.input( editableField, { target: { innerText: 'New Label' } } );
			fireEvent.blur( editableField );

			// Assert
			await waitFor( () => {
				expect( screen.getByTestId( 'editing-state' ) ).toHaveTextContent( 'not-editing' );
			} );
		} );

		it( 'should not throw when submitting with valid IDs', async () => {
			// Arrange
			const overridableProps = createMockOverridableProps();
			dispatch( slice.actions.load( [ createMockComponent( overridableProps ) ] ) );
			dispatch( slice.actions.setCurrentComponentId( MOCK_COMPONENT_ID ) );

			const ErrorFallback = () => <div data-testid="error-fallback">Error occurred</div>;
			renderWithStore(
				<ErrorBoundary fallback={ <ErrorFallback /> }>
					<TestComponent />
				</ErrorBoundary>,
				store
			);

			// Act
			const startEditingButton = screen.getByTestId( 'start-editing' );
			fireEvent.click( startEditingButton );

			await waitFor( () => {
				expect( screen.getByTestId( 'editing-state' ) ).toHaveTextContent( 'editing' );
			} );

			const editableField = screen.getByTestId( 'editable-field' );
			fireEvent.input( editableField, { target: { innerText: 'New Label' } } );
			fireEvent.blur( editableField );

			// Assert
			await waitFor( () => {
				expect( screen.getByTestId( 'editing-state' ) ).toHaveTextContent( 'not-editing' );
			} );
			expect( screen.queryByTestId( 'error-fallback' ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'editingGroupId state', () => {
		it( 'should set editingGroupId when setEditingGroupId is called', async () => {
			// Arrange
			const overridableProps = createMockOverridableProps();
			dispatch( slice.actions.load( [ createMockComponent( overridableProps ) ] ) );
			dispatch( slice.actions.setCurrentComponentId( MOCK_COMPONENT_ID ) );
			renderWithStore( <TestComponent />, store );

			// Assert - initial state
			expect( screen.getByTestId( 'editing-group-id' ) ).toHaveTextContent( 'null' );

			// Act
			const startEditingButton = screen.getByTestId( 'start-editing' );
			fireEvent.click( startEditingButton );

			// Assert
			await waitFor( () => {
				expect( screen.getByTestId( 'editing-group-id' ) ).toHaveTextContent( MOCK_GROUP_ID );
			} );
		} );

		it( 'should open edit mode when setEditingGroupId is called', async () => {
			// Arrange
			const overridableProps = createMockOverridableProps();
			dispatch( slice.actions.load( [ createMockComponent( overridableProps ) ] ) );
			dispatch( slice.actions.setCurrentComponentId( MOCK_COMPONENT_ID ) );
			renderWithStore( <TestComponent />, store );

			// Assert - initial state
			expect( screen.getByTestId( 'editing-state' ) ).toHaveTextContent( 'not-editing' );

			// Act
			const startEditingButton = screen.getByTestId( 'start-editing' );
			fireEvent.click( startEditingButton );

			// Assert
			await waitFor( () => {
				expect( screen.getByTestId( 'editing-state' ) ).toHaveTextContent( 'editing' );
			} );
		} );
	} );
} );
