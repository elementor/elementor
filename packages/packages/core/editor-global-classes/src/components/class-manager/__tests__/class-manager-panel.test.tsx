import * as React from 'react';
import {
	createMockDocument,
	createMockStyleDefinition,
	createMockTrackingModule,
	dispatchDependencyCommand,
	mockTracking,
	renderWithStore,
} from 'test-utils';
import { getCurrentDocument } from '@elementor/editor-documents';
import { __privateRunCommand } from '@elementor/editor-v1-adapters';
import { QueryClient, QueryClientProvider } from '@elementor/query';
import { __createStore, __dispatch, __registerSlice, type SliceState, type Store } from '@elementor/store';
import { ThemeProvider } from '@elementor/ui';
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';

import { apiClient } from '../../../api';
import { slice } from '../../../store';
import { ClassManagerPanelView } from '../class-manager-panel';

jest.mock( '@elementor/editor-documents' );
jest.mock( '../class-manager-introduction' );
jest.mock( '../start-sync-to-v3-modal' );

jest.mock( '../../../api' );

jest.mock( '@elementor/editor-current-user', () => ( {
	useSuppressedMessage: jest.fn().mockReturnValue( [ false, jest.fn() ] ),
} ) );

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	...jest.requireActual( '@elementor/editor-v1-adapters' ),
	__privateRunCommand: jest.fn(),
	changeEditMode: jest.fn(),
} ) );


jest.mock( '../panel-interactions', () => ( {
	blockPanelInteractions: jest.fn(),
	unblockPanelInteractions: jest.fn(),
} ) );

jest.mock( '../../../utils/tracking', () => createMockTrackingModule( 'trackGlobalClasses' ) );

describe( 'ClassManagerPanel', () => {
	const onRequestClose = jest.fn();
	let store: Store< SliceState< typeof slice > >;

	const queryClient = new QueryClient( {
		defaultOptions: {
			queries: {
				retry: false,
			},
		},
	} );

	beforeEach( () => {
		__registerSlice( slice );

		store = __createStore();

		const globalClass1 = createMockStyleDefinition( { id: 'class-1', label: 'Class 1' } );
		const globalClass2 = createMockStyleDefinition( { id: 'class-2', label: 'Class 2' } );

		const data = {
			items: {
				'class-1': globalClass1,
				'class-2': globalClass2,
			},
			order: [ 'class-2', 'class-1' ],
		};

		__dispatch(
			slice.actions.load( {
				frontend: data,
				preview: data,
			} )
		);

		jest.mocked( getCurrentDocument ).mockReturnValue( createMockDocument( { id: 1 } ) );
		onRequestClose.mockClear();
	} );

	it( 'should have a disabled "save changes" button when dirty state is false', () => {
		// Act.
		renderWithStore(
			<ThemeProvider>
				<QueryClientProvider client={ queryClient }>
					<ClassManagerPanelView onRequestClose={ onRequestClose } />
				</QueryClientProvider>
			</ThemeProvider>,
			store
		);
		// Assert.
		expect( screen.getByRole( 'button', { name: 'Save changes' } ) ).toBeDisabled();
	} );

	it( 'should have an enabled "save changes" button when changing the order', async () => {
		// Act.
		renderWithStore(
			<QueryClientProvider client={ queryClient }>
				<ClassManagerPanelView onRequestClose={ onRequestClose } />
			</QueryClientProvider>,
			store
		);

		act( () => {
			__dispatch( slice.actions.setOrder( [ 'class-1', 'class-2' ] ) );
		} );

		const saveButton = screen.getByRole( 'button', { name: 'Save changes' } );

		fireEvent.click( saveButton );

		// Assert.
		await waitFor( () => {
			expect( apiClient.publish ).toHaveBeenCalledWith( {
				items: {
					'class-1': createMockStyleDefinition( { id: 'class-1', label: 'Class 1' } ),
					'class-2': createMockStyleDefinition( { id: 'class-2', label: 'Class 2' } ),
				},
				order: [ 'class-1', 'class-2' ],
				changes: { added: [], deleted: [], modified: [] },
			} );
		} );
	} );

	it( 'should have an enabled "save changes" button when deleting a class', async () => {
		// Act.
		renderWithStore(
			<QueryClientProvider client={ queryClient }>
				<ClassManagerPanelView onRequestClose={ onRequestClose } />
			</QueryClientProvider>,
			store
		);

		act( () => {
			__dispatch( slice.actions.delete( 'class-1' ) );
		} );

		const saveButton = screen.getByRole( 'button', { name: 'Save changes' } );

		fireEvent.click( saveButton );

		// Assert.
		await waitFor( () => {
			expect( apiClient.publish ).toHaveBeenCalledWith( {
				items: {
					'class-2': createMockStyleDefinition( { id: 'class-2', label: 'Class 2' } ),
				},
				order: [ 'class-2' ],
				changes: { added: [], deleted: [ 'class-1' ], modified: [] },
			} );
		} );
	} );

	it( 'should have an enabled "save changes" button when renaming a class', async () => {
		// Act.
		renderWithStore(
			<QueryClientProvider client={ queryClient }>
				<ClassManagerPanelView onRequestClose={ onRequestClose } />
			</QueryClientProvider>,
			store
		);

		act( () => {
			__dispatch( slice.actions.update( { style: { id: 'class-1', label: 'New label' } } ) );
		} );

		const saveButton = screen.getByRole( 'button', { name: 'Save changes' } );

		fireEvent.click( saveButton );

		// Assert.
		await waitFor( () => {
			expect( apiClient.publish ).toHaveBeenCalledWith( {
				items: {
					'class-1': createMockStyleDefinition( { id: 'class-1', label: 'New label' } ),
					'class-2': createMockStyleDefinition( { id: 'class-2', label: 'Class 2' } ),
				},
				order: [ 'class-2', 'class-1' ],
				changes: { added: [], deleted: [], modified: [ 'class-1' ] },
			} );
		} );
	} );

	it( 'should show the browser alert when trying to close with unsaved changes', () => {
		// Act.
		renderWithStore(
			<QueryClientProvider client={ queryClient }>
				<ClassManagerPanelView onRequestClose={ onRequestClose } />
			</QueryClientProvider>,
			store
		);

		act( () => {
			__dispatch( slice.actions.setOrder( [ 'class-1', 'class-2' ] ) );
		} );

		// Assert.
		expect( window.onbeforeunload ).toBeDefined();
	} );

	it( 'should not show the browser alert when trying to close with no unsaved changes', () => {
		// Act.
		renderWithStore(
			<QueryClientProvider client={ queryClient }>
				<ClassManagerPanelView onRequestClose={ onRequestClose } />
			</QueryClientProvider>,
			store
		);

		// Assert.
		expect( window.onbeforeunload ).toBeNull();
	} );

	it( 'should save deleted classes successfully', async () => {
		// Act.
		renderWithStore(
			<ThemeProvider>
				<QueryClientProvider client={ queryClient }>
					<ClassManagerPanelView onRequestClose={ onRequestClose } />
				</QueryClientProvider>
			</ThemeProvider>,
			store
		);

		const [ firstClass ] = screen.getAllByRole( 'listitem' );

		fireEvent.click( within( firstClass ).getByRole( 'button', { name: 'More actions' } ) );

		const deleteButton = screen.getByRole( 'menuitem', { name: 'Delete' } );

		fireEvent.click( deleteButton );

		// Assert.
		await waitFor( () => {
			expect( screen.getByRole( 'dialog', { name: 'Delete this class?' } ) ).toBeInTheDocument();
		} );

		// Act.
		fireEvent.click( screen.getByRole( 'button', { name: 'Delete' } ) );

		dispatchDependencyCommand( 'panel/open' );

		// Assert.
		await waitFor( () => {
			expect( screen.getByRole( 'button', { name: 'Save changes' } ) ).toBeEnabled();
		} );

		// Act.
		fireEvent.click( screen.getByRole( 'button', { name: 'Save changes' } ) );

		// Assert - Verify that publish was called with deleted class
		await waitFor( () => {
			expect( apiClient.publish ).toHaveBeenCalledWith( {
				items: {
					'class-1': createMockStyleDefinition( { id: 'class-1', label: 'Class 1' } ),
				},
				order: [ 'class-1' ],
				changes: { added: [], deleted: [ 'class-2' ], modified: [] },
			} );
		} );
	} );

	it( 'should not reload the current if the changes did not contain any deletions', async () => {
		// Act.
		renderWithStore(
			<ThemeProvider>
				<QueryClientProvider client={ queryClient }>
					<ClassManagerPanelView onRequestClose={ onRequestClose } />
				</QueryClientProvider>
			</ThemeProvider>,
			store
		);

		const [ firstClass ] = screen.getAllByRole( 'listitem' );

		fireEvent.click( within( firstClass ).getByRole( 'button', { name: 'More actions' } ) );

		const renameButton = screen.getByRole( 'menuitem', { name: 'Rename' } );

		// Assert.
		expect( renameButton ).toBeInTheDocument();

		// Act.
		fireEvent.click( renameButton );

		// Assert.
		// Menu should be closed after clicking rename.
		await waitFor( () => {
			expect( renameButton ).not.toBeInTheDocument();
		} );

		const textboxes = await screen.findAllByRole( 'textbox' );
		const editableField = textboxes.find( ( el ) => el.getAttribute( 'contenteditable' ) === 'true' );

		expect( editableField ).toBeInTheDocument();

		// Act.
		fireEvent.input( editableField as Element, { target: { innerText: 'New-Class-Name' } } );

		fireEvent.blur( editableField as Element );

		// Assert.
		await waitFor( () => {
			expect( screen.getByRole( 'button', { name: 'Save changes' } ) ).toBeEnabled();
		} );

		// Act.
		fireEvent.click( screen.getByRole( 'button', { name: 'Save changes' } ) );

		// Assert.
		await waitFor( () => {
			expect( __privateRunCommand ).not.toHaveBeenCalled();
		} );
	} );

	it( 'should restore to initial state on clicking "discard"', () => {
		// Arrange.
		jest.spyOn( slice.actions, 'resetToInitialState' );

		act( () => __dispatch( slice.actions.setOrder( [ 'class-1', 'class-2' ] ) ) );
		// Act.
		renderWithStore(
			<ThemeProvider>
				<QueryClientProvider client={ queryClient }>
					<ClassManagerPanelView onRequestClose={ onRequestClose } />
				</QueryClientProvider>
			</ThemeProvider>,
			store
		);
		const closeButton = screen.getByRole( 'button', { name: 'Close' } );

		fireEvent.click( closeButton );

		const discardButton = screen.getByText( 'Discard' );
		fireEvent.click( discardButton );
		expect( slice.actions.resetToInitialState ).toHaveBeenCalledWith( { context: 'frontend' } );
		expect( store.getState().globalClasses.data.order ).toEqual( [ 'class-2', 'class-1' ] );
	} );

	it( 'should track classManagerSearched event when search field is focused', () => {
		// Act
		renderWithStore(
			<QueryClientProvider client={ queryClient }>
				<ClassManagerPanelView onRequestClose={ onRequestClose } />
			</QueryClientProvider>,
			store
		);

		const input = screen.getByRole( 'textbox' );

		// Act
		fireEvent.focus( input );

		// Assert
		expect( mockTracking ).toHaveBeenCalledWith( {
			event: 'classManagerSearched',
		} );
	} );

	it( 'should track syncToV3 unsync event when stopping sync via confirmation dialog', async () => {
		// Arrange
		act( () => {
			__dispatch( slice.actions.update( { style: { id: 'class-2', sync_to_v3: true } } ) );
		} );

		// Act
		renderWithStore(
			<ThemeProvider>
				<QueryClientProvider client={ queryClient }>
					<ClassManagerPanelView onRequestClose={ onRequestClose } />
				</QueryClientProvider>
			</ThemeProvider>,
			store
		);

		const [ firstClass ] = screen.getAllByRole( 'listitem' );

		fireEvent.click( within( firstClass ).getByRole( 'button', { name: 'More actions' } ) );

		const stopSyncButton = screen.getByRole( 'menuitem', { name: /Stop syncing to Global Fonts/i } );

		fireEvent.click( stopSyncButton );

		// Assert
		await waitFor( () => {
			expect( screen.getByText( 'Un-sync typography class' ) ).toBeInTheDocument();
		} );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Got it' } ) );

		// Assert
		await waitFor( () => {
			expect( mockTracking ).toHaveBeenCalledWith( {
				event: 'classSyncToV3',
				classId: 'class-2',
				action: 'unsync',
			} );
		} );
	} );
} );
