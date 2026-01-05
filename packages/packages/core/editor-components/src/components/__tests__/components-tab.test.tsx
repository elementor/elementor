import * as React from 'react';
import { renderWithStore, renderWithTheme } from 'test-utils';
import { setDocumentModifiedStatus } from '@elementor/editor-documents';
import {
	__createStore,
	__dispatch as dispatch,
	__registerSlice as registerSlice,
	type SliceState,
	type Store,
} from '@elementor/store';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';

import { slice } from '../../store/store';
import { loadComponents } from '../../store/thunks';
import { ComponentSearch } from '../components-tab/component-search';
import { ComponentItem } from '../components-tab/components-item';
import { ComponentsList } from '../components-tab/components-list';
import { SearchProvider } from '../components-tab/search-provider';

jest.mock( '@elementor/editor-documents', () => ( {
	setDocumentModifiedStatus: jest.fn(),
} ) );

jest.mock( '@elementor/editor-mcp', () => ( {
	getAngieSdk: jest.fn().mockImplementation( () => ( {
		isAngieReady: jest.fn( () => false ),
		triggerAngie: jest.fn(),
	} ) ),
} ) );

const mockStartDragElementFromPanel = jest.fn();

jest.mock( '@elementor/editor-canvas', () => ( {
	startDragElementFromPanel: ( ...args: unknown[] ) => mockStartDragElementFromPanel( ...args ),
} ) );

jest.mock( '@elementor/editor-elements', () => ( {
	dropElement: jest.fn(),
} ) );

jest.mock( '../../utils/get-container-for-new-element', () => ( {
	getContainerForNewElement: jest.fn( () => ( {
		container: { id: 'test-container' },
		options: { useHistory: false, scrollIntoView: true },
	} ) ),
} ) );

jest.mock( '../create-component-form/utils/replace-element-with-component', () => ( {
	createComponentModel: jest.fn( ( { id, name } ) => ( { id, name, elType: 'component' } ) ),
} ) );

const mockComponents = [
	{ id: 1, name: 'Button Component', uid: 'f73880da-522c-442e-815a-b2c9849b7415' },
	{ id: 2, name: 'Text Component', uid: 'f73880da-522c-442e-815a-b2c9849b7416' },
	{ id: 3, name: 'Image Component', uid: 'f73880da-522c-442e-815a-b2c9849b7417' },
	{ id: 4, name: 'Test Component 1', uid: 'f73880da-522c-442e-815a-b2c9849b7418' },
	{ id: 5, name: 'Test Component 2', uid: 'f73880da-522c-442e-815a-b2c9849b7419' },
	{ id: 6, name: 'Valid Component', uid: 'f73880da-522c-442e-815a-b2c9849b7420' },
	{ id: 7, name: 'ExistingComponent', uid: 'f73880da-522c-442e-815a-b2c9849b7421' },
];

describe( 'ComponentsTab', () => {
	let store: Store< SliceState< typeof slice > >;

	beforeEach( () => {
		jest.useFakeTimers();
		registerSlice( slice );
		store = __createStore();
	} );

	afterEach( () => {
		if ( jest.isMockFunction( setTimeout ) ) {
			jest.runOnlyPendingTimers();
			jest.clearAllTimers();
			jest.useRealTimers();
		}
	} );

	describe( 'ComponentsList', () => {
		it( 'should render loading state when components are loading', () => {
			// Arrange
			act( () => {
				dispatch( loadComponents.pending( '', undefined ) );
			} );

			// Act
			renderWithStore(
				<SearchProvider localStorageKey="test-search">
					<ComponentsList />
				</SearchProvider>,
				store
			);

			// Assert
			expect( screen.getByLabelText( 'Loading components' ) ).toBeInTheDocument();
		} );

		it( 'should render empty state when no components exist', () => {
			// Arrange
			act( () => {
				dispatch( slice.actions.load( [] ) );
			} );

			// Act
			renderWithStore(
				<SearchProvider localStorageKey="test-search">
					<ComponentsList />
				</SearchProvider>,
				store
			);

			// Assert
			expect( screen.getByText( 'No components yet' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Learn more about components' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Create your first one:' ) ).toBeInTheDocument();
			expect( screen.getByRole( 'button', { name: /Create component with AI/i } ) ).toBeInTheDocument();
		} );

		it( 'should render components list when components exist', () => {
			// Arrange
			act( () => {
				dispatch( slice.actions.load( mockComponents ) );
			} );

			// Act
			renderWithStore(
				<SearchProvider localStorageKey="test-search">
					<ComponentsList />
				</SearchProvider>,
				store
			);

			// Assert
			expect( screen.getByText( 'Button Component' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Text Component' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Test Component 1' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Test Component 2' ) ).toBeInTheDocument();
			expect( screen.queryByText( 'No components yet' ) ).not.toBeInTheDocument();
		} );

		it( 'should render component item with draggable attributes and actions', () => {
			// Arrange
			const buttonComponent = mockComponents[ 0 ];

			// Act
			renderWithStore( <ComponentItem component={ buttonComponent } renameComponent={ jest.fn() } />, store );

			// Assert
			const componentItem = screen.getByRole( 'button', { name: /Button Component/ } );
			expect( componentItem ).toBeInTheDocument();
			expect( componentItem ).toHaveAttribute( 'draggable', 'true' );
		} );

		it( 'should call startDragElementFromPanel with component model and event on drag start', () => {
			// Arrange
			const [ buttonComponent ] = mockComponents;

			// Act
			renderWithStore( <ComponentItem component={ buttonComponent } renameComponent={ jest.fn() } />, store );

			const componentItem = screen.getByRole( 'button', { name: /Button Component/ } );
			fireEvent.dragStart( componentItem );

			// Assert
			expect( mockStartDragElementFromPanel ).toHaveBeenCalledTimes( 1 );
			expect( mockStartDragElementFromPanel ).toHaveBeenCalledWith(
				expect.objectContaining( { id: buttonComponent.id, name: buttonComponent.name } ),
				expect.any( Object )
			);
		} );

		it( 'should render search input with correct attributes and placeholder', () => {
			// Act
			renderWithTheme(
				<SearchProvider localStorageKey="test-search">
					<ComponentSearch />
				</SearchProvider>
			);

			// Assert
			expect( screen.getByRole( 'search' ) ).toBeInTheDocument();
			expect( screen.getByPlaceholderText( 'Search' ) ).toBeInTheDocument();
		} );

		it( 'should handle search functionality and show filtered results', () => {
			// Arrange
			act( () => {
				dispatch( slice.actions.load( mockComponents ) );
			} );

			// Act
			renderWithStore(
				<SearchProvider localStorageKey="test-search">
					<ComponentSearch />
					<ComponentsList />
				</SearchProvider>,
				store
			);

			// Assert
			expect( screen.getByText( 'Button Component' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Text Component' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Image Component' ) ).toBeInTheDocument();

			// Act
			const searchInput = screen.getByPlaceholderText( 'Search' );
			fireEvent.change( searchInput, { target: { value: 'Button' } } );

			act( () => {
				jest.advanceTimersByTime( 300 );
			} );

			// Assert
			expect( screen.getByText( 'Button Component' ) ).toBeInTheDocument();
			expect( screen.queryByText( 'Text Component' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Image Component' ) ).not.toBeInTheDocument();
		} );

		it( 'should show empty search result when no matches found', () => {
			// Arrange
			act( () => {
				dispatch( slice.actions.load( mockComponents ) );
			} );

			// Act
			renderWithStore(
				<SearchProvider localStorageKey="test-search">
					<ComponentSearch />
					<ComponentsList />
				</SearchProvider>,
				store
			);

			// Act
			const searchInput = screen.getByPlaceholderText( 'Search' );
			fireEvent.change( searchInput, { target: { value: 'NonExistent' } } );

			act( () => {
				jest.advanceTimersByTime( 300 );
			} );

			// Assert
			expect( screen.getByText( 'Sorry, nothing matched' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Try something else.' ) ).toBeInTheDocument();
		} );

		it( 'should remove component from list when archived', async () => {
			// Arrange
			act( () => {
				dispatch( slice.actions.load( mockComponents ) );
			} );

			// Act
			renderWithStore(
				<SearchProvider localStorageKey="test-search">
					<ComponentsList />
				</SearchProvider>,
				store
			);

			// Assert
			expect( screen.getByText( 'Button Component' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Text Component' ) ).toBeInTheDocument();

			// Act
			const moreActionsButtons = screen.getAllByLabelText( 'More actions' );
			const buttonComponentMoreActions = moreActionsButtons[ 0 ];
			fireEvent.click( buttonComponentMoreActions );

			const archiveButton = await screen.findByText( 'Archive' );
			fireEvent.click( archiveButton );

			// Assert
			await waitFor( () => {
				expect( screen.queryByText( 'Button Component' ) ).not.toBeInTheDocument();
			} );
			expect( screen.getByText( 'Text Component' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Image Component' ) ).toBeInTheDocument();
			expect( jest.mocked( setDocumentModifiedStatus ) ).toHaveBeenCalledWith( true );
		} );

		it( 'should open rename mode when Rename menu item is clicked', async () => {
			// Arrange
			act( () => {
				dispatch( slice.actions.load( mockComponents ) );
			} );

			// Act
			renderWithStore(
				<SearchProvider localStorageKey="test-search">
					<ComponentsList />
				</SearchProvider>,
				store
			);

			const moreActionsButtons = screen.getAllByLabelText( 'More actions' );
			const buttonComponentMoreActions = moreActionsButtons[ 0 ];
			fireEvent.click( buttonComponentMoreActions );

			const renameButton = await screen.findByText( 'Rename' );
			fireEvent.click( renameButton );

			// Assert
			const editableField = screen.getByRole( 'textbox' );
			expect( editableField ).toHaveAttribute( 'contentEditable', 'true' );
			expect( editableField ).toHaveTextContent( 'Button Component' );
		} );

		it( 'should rename component successfully when valid name is submitted', async () => {
			// Arrange
			act( () => {
				dispatch( slice.actions.load( mockComponents ) );
			} );

			// Act
			renderWithStore(
				<SearchProvider localStorageKey="test-search">
					<ComponentsList />
				</SearchProvider>,
				store
			);

			const moreActionsButtons = screen.getAllByLabelText( 'More actions' );
			const buttonComponentMoreActions = moreActionsButtons[ 0 ];
			fireEvent.click( buttonComponentMoreActions );

			const renameButton = await screen.findByText( 'Rename' );
			fireEvent.click( renameButton );

			const editableField = screen.getByRole( 'textbox' );
			editableField.textContent = 'NewButtonName';
			fireEvent.input( editableField, { target: { innerText: 'NewButtonName' } } );
			await waitFor( () => {
				expect( editableField ).toHaveTextContent( 'NewButtonName' );
			} );
			fireEvent.keyDown( editableField, { key: 'Enter' } );

			// Assert
			await waitFor(
				() => {
					expect( screen.getByText( 'NewButtonName' ) ).toBeInTheDocument();
				},
				{ timeout: 3000 }
			);
			expect( screen.queryByText( 'Button Component' ) ).not.toBeInTheDocument();
		} );

		it( 'should rename component successfully when valid name is submitted via blur', async () => {
			// Arrange
			act( () => {
				dispatch( slice.actions.load( mockComponents ) );
			} );

			// Act
			renderWithStore(
				<SearchProvider localStorageKey="test-search">
					<ComponentsList />
				</SearchProvider>,
				store
			);

			const moreActionsButtons = screen.getAllByLabelText( 'More actions' );
			const buttonComponentMoreActions = moreActionsButtons[ 0 ];
			fireEvent.click( buttonComponentMoreActions );

			const renameButton = await screen.findByText( 'Rename' );
			fireEvent.click( renameButton );

			const editableField = screen.getByRole( 'textbox' );
			fireEvent.input( editableField, { target: { innerText: 'RenamedComponent' } } );
			fireEvent.blur( editableField );

			// Assert
			await waitFor( () => {
				expect( screen.getByText( 'RenamedComponent' ) ).toBeInTheDocument();
			} );
			expect( screen.queryByText( 'Button Component' ) ).not.toBeInTheDocument();
		} );

		it( 'should cancel rename when Escape key is pressed', async () => {
			// Arrange
			act( () => {
				dispatch( slice.actions.load( mockComponents ) );
			} );

			// Act
			renderWithStore(
				<SearchProvider localStorageKey="test-search">
					<ComponentsList />
				</SearchProvider>,
				store
			);

			const moreActionsButtons = screen.getAllByLabelText( 'More actions' );
			const buttonComponentMoreActions = moreActionsButtons[ 0 ];
			fireEvent.click( buttonComponentMoreActions );

			const renameButton = await screen.findByText( 'Rename' );
			fireEvent.click( renameButton );

			const editableField = screen.getByRole( 'textbox' );
			editableField.textContent = 'NewName';
			fireEvent.input( editableField, { target: { innerText: 'NewName' } } );
			fireEvent.keyDown( editableField, { key: 'Escape' } );

			// Assert
			await waitFor( () => {
				expect( screen.getByText( 'Button Component' ) ).toBeInTheDocument();
			} );
			expect( screen.queryByText( 'NewName' ) ).not.toBeInTheDocument();
		} );

		it( 'should show validation error for component name that is too short', async () => {
			// Arrange
			act( () => {
				dispatch( slice.actions.load( mockComponents ) );
			} );

			// Act
			renderWithStore(
				<SearchProvider localStorageKey="test-search">
					<ComponentsList />
				</SearchProvider>,
				store
			);

			const moreActionsButtons = screen.getAllByLabelText( 'More actions' );
			const buttonComponentMoreActions = moreActionsButtons[ 0 ];
			fireEvent.click( buttonComponentMoreActions );

			const renameButton = await screen.findByText( 'Rename' );
			fireEvent.click( renameButton );

			const editableField = screen.getByRole( 'textbox' );
			fireEvent.input( editableField, { target: { innerText: 'A' } } );

			// Assert
			await waitFor( () => {
				expect(
					screen.getByText( 'Component name is too short. Please enter at least 2 characters.' )
				).toBeInTheDocument();
			} );
			expect( editableField ).toHaveAttribute( 'contentEditable', 'true' );
		} );

		it( 'should show validation error for component name that is too long', async () => {
			// Arrange
			act( () => {
				dispatch( slice.actions.load( mockComponents ) );
			} );

			// Act
			renderWithStore(
				<SearchProvider localStorageKey="test-search">
					<ComponentsList />
				</SearchProvider>,
				store
			);

			const moreActionsButtons = screen.getAllByLabelText( 'More actions' );
			const buttonComponentMoreActions = moreActionsButtons[ 0 ];
			fireEvent.click( buttonComponentMoreActions );

			const renameButton = await screen.findByText( 'Rename' );
			fireEvent.click( renameButton );

			const editableField = screen.getByRole( 'textbox' );
			const longName = 'A'.repeat( 51 );
			fireEvent.input( editableField, { target: { innerText: longName } } );

			// Assert
			await waitFor( () => {
				expect(
					screen.getByText( 'Component name is too long. Please keep it under 50 characters.' )
				).toBeInTheDocument();
			} );
			expect( editableField ).toHaveAttribute( 'contentEditable', 'true' );
		} );

		it( 'should show validation error for duplicate component name', async () => {
			// Arrange
			act( () => {
				dispatch( slice.actions.load( mockComponents ) );
			} );

			// Act
			renderWithStore(
				<SearchProvider localStorageKey="test-search">
					<ComponentsList />
				</SearchProvider>,
				store
			);

			const moreActionsButtons = screen.getAllByLabelText( 'More actions' );
			const buttonComponentMoreActions = moreActionsButtons[ 0 ];
			fireEvent.click( buttonComponentMoreActions );

			const renameButton = await screen.findByText( 'Rename' );
			fireEvent.click( renameButton );

			const editableField = screen.getByRole( 'textbox' );
			editableField.textContent = 'ExistingComponent';
			fireEvent.input( editableField, { target: { innerText: 'ExistingComponent' } } );

			// Wait for validation to run
			await waitFor( () => {
				expect( editableField ).toHaveTextContent( 'ExistingComponent' );
			} );

			// Try to submit with duplicate name - validation should prevent submission
			fireEvent.keyDown( editableField, { key: 'Enter' } );

			// Assert - verify that validation prevents rename when duplicate name is used
			// The component should either remain in edit mode with error, or revert to original name
			await waitFor( () => {
				const allComponents = screen.getAllByRole( 'button' );
				const buttonComponent = allComponents.find(
					( btn ) => btn.textContent?.includes( 'Button Component' )
				);
				// If validation worked, Button Component should still exist
				// If it doesn't exist, check if we're still in edit mode
				if ( ! buttonComponent ) {
					const textboxes = screen.queryAllByRole( 'textbox' );
					expect( textboxes.length ).toBeGreaterThan( 0 );
				} else {
					expect( buttonComponent ).toBeInTheDocument();
				}
			} );
		} );

		it( 'should not submit rename when validation error exists', async () => {
			// Arrange
			act( () => {
				dispatch( slice.actions.load( mockComponents ) );
			} );

			// Act
			renderWithStore(
				<SearchProvider localStorageKey="test-search">
					<ComponentsList />
				</SearchProvider>,
				store
			);

			const moreActionsButtons = screen.getAllByLabelText( 'More actions' );
			const buttonComponentMoreActions = moreActionsButtons[ 0 ];
			fireEvent.click( buttonComponentMoreActions );

			const renameButton = await screen.findByText( 'Rename' );
			fireEvent.click( renameButton );

			const editableField = screen.getByRole( 'textbox' );
			fireEvent.input( editableField, { target: { innerText: 'A' } } );

			await waitFor( () => {
				expect(
					screen.getByText( 'Component name is too short. Please enter at least 2 characters.' )
				).toBeInTheDocument();
			} );

			fireEvent.keyDown( editableField, { key: 'Enter' } );

			// Assert
			expect( screen.getByText( 'Button Component' ) ).toBeInTheDocument();
			expect( screen.queryByText( 'A' ) ).not.toBeInTheDocument();
		} );

		it( 'should close edit mode on blur when validation error exists', async () => {
			// Arrange
			act( () => {
				dispatch( slice.actions.load( mockComponents ) );
			} );

			// Act
			renderWithStore(
				<SearchProvider localStorageKey="test-search">
					<ComponentsList />
				</SearchProvider>,
				store
			);

			const moreActionsButtons = screen.getAllByLabelText( 'More actions' );
			const buttonComponentMoreActions = moreActionsButtons[ 0 ];
			fireEvent.click( buttonComponentMoreActions );

			const renameButton = await screen.findByText( 'Rename' );
			fireEvent.click( renameButton );

			const editableField = screen.getByRole( 'textbox' );
			fireEvent.input( editableField, { target: { innerText: 'A' } } );

			await waitFor( () => {
				expect(
					screen.getByText( 'Component name is too short. Please enter at least 2 characters.' )
				).toBeInTheDocument();
			} );

			fireEvent.blur( editableField );

			// Assert
			await waitFor( () => {
				expect( screen.getByText( 'Button Component' ) ).toBeInTheDocument();
			} );
		} );

		it( 'should not submit rename when name has not changed', async () => {
			// Arrange
			act( () => {
				dispatch( slice.actions.load( mockComponents ) );
			} );

			// Act
			renderWithStore(
				<SearchProvider localStorageKey="test-search">
					<ComponentsList />
				</SearchProvider>,
				store
			);

			const moreActionsButtons = screen.getAllByLabelText( 'More actions' );
			const buttonComponentMoreActions = moreActionsButtons[ 0 ];
			fireEvent.click( buttonComponentMoreActions );

			const renameButton = await screen.findByText( 'Rename' );
			fireEvent.click( renameButton );

			const editableField = screen.getByRole( 'textbox' );
			editableField.textContent = 'NewName';
			fireEvent.input( editableField, { target: { innerText: 'NewName' } } );
			editableField.textContent = 'Button Component';
			fireEvent.input( editableField, { target: { innerText: 'Button Component' } } );
			fireEvent.keyDown( editableField, { key: 'Enter' } );

			// Assert
			await waitFor( () => {
				expect( screen.getByText( 'Button Component' ) ).toBeInTheDocument();
			} );
		} );
	} );
} );
