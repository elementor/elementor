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
import { loadExistingClasses } from '../../../load-existing-classes';
import { slice } from '../../../store';
import { ClassManagerPanelEmbedded } from '../class-manager-panel';

const PANEL_TEST_ROW_HEIGHT = 40;

jest.mock( '@tanstack/react-virtual', () => ( {
	useVirtualizer: jest.fn().mockImplementation( ( config ) => {
		const { count, getItemKey } = config;
		const indices = Array.from( { length: count }, ( _, i ) => i );

		return {
			getTotalSize: jest.fn().mockReturnValue( count * PANEL_TEST_ROW_HEIGHT ),
			getVirtualItems: jest.fn().mockReturnValue(
				indices.map( ( index ) => ( {
					index,
					key: getItemKey ? getItemKey( index ) : index,
					start: index * PANEL_TEST_ROW_HEIGHT,
					end: ( index + 1 ) * PANEL_TEST_ROW_HEIGHT,
					size: PANEL_TEST_ROW_HEIGHT,
					lane: 0,
				} ) )
			),
		};
	} ),
} ) );

jest.mock( '@elementor/editor-documents' );
jest.mock( '../class-manager-introduction' );
jest.mock( '../start-sync-to-v3-modal', () => ( {
	StartSyncToV3Modal: ( { onConfirm, externalOpen }: { onConfirm?: () => void; externalOpen?: boolean } ) =>
		externalOpen ? (
			<button type="button" onClick={ onConfirm }>
				Confirm sync
			</button>
		) : null,
} ) );

jest.mock( '../../../api' );
jest.mock( '../../../load-existing-classes', () => ( {
	loadExistingClasses: jest.fn().mockResolvedValue( undefined ),
} ) );

jest.mock( '@elementor/editor-current-user', () => ( {
	useSuppressedMessage: jest.fn().mockReturnValue( [ false, jest.fn() ] ),
} ) );

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	...jest.requireActual( '@elementor/editor-v1-adapters' ),
	__privateRunCommand: jest.fn(),
} ) );

jest.mock( '../panel-interactions', () => ( {
	blockPanelInteractions: jest.fn(),
	unblockPanelInteractions: jest.fn(),
} ) );

jest.mock( '../../../utils/tracking', () => createMockTrackingModule( 'trackGlobalClasses' ) );

describe( 'ClassManagerPanel', () => {
	let store: Store< SliceState< typeof slice > >;

	const queryClient = new QueryClient( {
		defaultOptions: {
			queries: {
				retry: false,
			},
		},
	} );

	beforeEach( () => {
		jest.clearAllMocks();
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
				classLabels: {
					'class-1': 'Class 1',
					'class-2': 'Class 2',
				},
			} )
		);

		jest.mocked( getCurrentDocument ).mockReturnValue( createMockDocument( { id: 1 } ) );
	} );

	it( 'should render embedded panel structure correctly', () => {
		// Act.
		renderWithStore(
			<ThemeProvider>
				<QueryClientProvider client={ queryClient }>
					<ClassManagerPanelEmbedded onRequestClose={ jest.fn() } onExposeCloseAttempt={ jest.fn() } />
				</QueryClientProvider>
			</ThemeProvider>,
			store
		);

		// Assert.
		expect( screen.getByRole( 'textbox' ) ).toBeInTheDocument();
		expect( screen.getByText( '2' ) ).toBeInTheDocument();
		expect( screen.getAllByRole( 'listitem' ) ).toHaveLength( 2 );
		expect( screen.getByRole( 'button', { name: 'Save changes' } ) ).toBeDisabled();
	} );

	it( 'should have a disabled "save changes" button when dirty state is false', () => {
		// Act.
		renderWithStore(
			<ThemeProvider>
				<QueryClientProvider client={ queryClient }>
					<ClassManagerPanelEmbedded onRequestClose={ jest.fn() } onExposeCloseAttempt={ jest.fn() } />
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
			<ThemeProvider>
				<QueryClientProvider client={ queryClient }>
					<ClassManagerPanelEmbedded onRequestClose={ jest.fn() } onExposeCloseAttempt={ jest.fn() } />
				</QueryClientProvider>
			</ThemeProvider>,
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
				items: {},
				order: [ 'class-1', 'class-2' ],
				changes: { added: [], deleted: [], modified: [], order: true },
			} );
		} );
	} );

	it( 'should have an enabled "save changes" button when deleting a class', async () => {
		// Act.
		renderWithStore(
			<ThemeProvider>
				<QueryClientProvider client={ queryClient }>
					<ClassManagerPanelEmbedded onRequestClose={ jest.fn() } onExposeCloseAttempt={ jest.fn() } />
				</QueryClientProvider>
			</ThemeProvider>,
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
				items: {},
				order: [ 'class-2' ],
				changes: { added: [], deleted: [ 'class-1' ], modified: [], order: true },
			} );
		} );
	} );

	it( 'should have an enabled "save changes" button when renaming a class', async () => {
		// Act.
		renderWithStore(
			<ThemeProvider>
				<QueryClientProvider client={ queryClient }>
					<ClassManagerPanelEmbedded onRequestClose={ jest.fn() } onExposeCloseAttempt={ jest.fn() } />
				</QueryClientProvider>
			</ThemeProvider>,
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
				},
				order: [ 'class-2', 'class-1' ],
				changes: { added: [], deleted: [], modified: [ 'class-1' ], order: false },
			} );
		} );
	} );

	it( 'should show a dialog when trying to close with unsaved changes, and allow to cancel the action', () => {
		// Arrange.
		const onRequestClose = jest.fn();
		let attemptClose: ( () => void ) | null = null;

		// Act.
		renderWithStore(
			<ThemeProvider>
				<QueryClientProvider client={ queryClient }>
					<ClassManagerPanelEmbedded
						onRequestClose={ onRequestClose }
						onExposeCloseAttempt={ ( cb ) => {
							attemptClose = cb;
						} }
					/>
				</QueryClientProvider>
			</ThemeProvider>,
			store
		);

		act( () => {
			__dispatch( slice.actions.setOrder( [ 'class-1', 'class-2' ] ) );
		} );

		act( () => {
			attemptClose?.();
		} );

		// Assert.
		expect( screen.getByText( 'You have unsaved changes' ) ).toBeInTheDocument();
		expect( onRequestClose ).not.toHaveBeenCalled();

		// Act.
		fireEvent.click( screen.getByRole( 'button', { name: 'close' } ) );

		// Assert.
		expect( onRequestClose ).not.toHaveBeenCalled();
	} );

	it( 'should show a dialog when trying to close with unsaved changes, and allow to save and continue', async () => {
		// Arrange.
		const onRequestClose = jest.fn();
		let attemptClose: ( () => void ) | null = null;

		// Act.
		renderWithStore(
			<ThemeProvider>
				<QueryClientProvider client={ queryClient }>
					<ClassManagerPanelEmbedded
						onRequestClose={ onRequestClose }
						onExposeCloseAttempt={ ( cb ) => {
							attemptClose = cb;
						} }
					/>
				</QueryClientProvider>
			</ThemeProvider>,
			store
		);

		act( () => {
			__dispatch( slice.actions.setOrder( [ 'class-1', 'class-2' ] ) );
		} );

		act( () => {
			attemptClose?.();
		} );

		// Assert.
		expect( screen.getByText( 'You have unsaved changes' ) ).toBeInTheDocument();
		expect( onRequestClose ).not.toHaveBeenCalled();

		// Act.
		const saveAndContinueButton = screen.getByRole( 'button', { name: 'Save & Continue' } );

		fireEvent.click( saveAndContinueButton );

		// Assert.
		await waitFor( () => {
			expect( apiClient.publish ).toHaveBeenCalledWith( {
				items: {},
				order: [ 'class-1', 'class-2' ],
				changes: { added: [], deleted: [], modified: [], order: true },
			} );
		} );

		await waitFor( () => {
			expect( onRequestClose ).toHaveBeenCalled();
		} );
	} );

	it( 'should not show the dialog when trying to close with no unsaved changes', () => {
		// Arrange.
		const onRequestClose = jest.fn();
		let attemptClose: ( () => void ) | null = null;

		// Act.
		renderWithStore(
			<ThemeProvider>
				<QueryClientProvider client={ queryClient }>
					<ClassManagerPanelEmbedded
						onRequestClose={ onRequestClose }
						onExposeCloseAttempt={ ( cb ) => {
							attemptClose = cb;
						} }
					/>
				</QueryClientProvider>
			</ThemeProvider>,
			store
		);

		act( () => {
			attemptClose?.();
		} );

		// Assert.
		expect( screen.queryByText( 'You have unsaved changes' ) ).not.toBeInTheDocument();
		expect( onRequestClose ).toHaveBeenCalled();
	} );

	it( 'should show the browser alert when trying to close with unsaved changes', () => {
		// Act.
		renderWithStore(
			<ThemeProvider>
				<QueryClientProvider client={ queryClient }>
					<ClassManagerPanelEmbedded onRequestClose={ jest.fn() } onExposeCloseAttempt={ jest.fn() } />
				</QueryClientProvider>
			</ThemeProvider>,
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
			<ThemeProvider>
				<QueryClientProvider client={ queryClient }>
					<ClassManagerPanelEmbedded onRequestClose={ jest.fn() } onExposeCloseAttempt={ jest.fn() } />
				</QueryClientProvider>
			</ThemeProvider>,
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
					<ClassManagerPanelEmbedded onRequestClose={ jest.fn() } onExposeCloseAttempt={ jest.fn() } />
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
				items: {},
				order: [ 'class-1' ],
				changes: { added: [], deleted: [ 'class-2' ], modified: [], order: true },
			} );
		} );
	} );

	it( 'should not reload the current if the changes did not contain any deletions', async () => {
		// Act.
		renderWithStore(
			<ThemeProvider>
				<QueryClientProvider client={ queryClient }>
					<ClassManagerPanelEmbedded onRequestClose={ jest.fn() } onExposeCloseAttempt={ jest.fn() } />
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
		let attemptClose: ( () => void ) | null = null;

		act( () => __dispatch( slice.actions.setOrder( [ 'class-1', 'class-2' ] ) ) );

		// Act.
		renderWithStore(
			<ThemeProvider>
				<QueryClientProvider client={ queryClient }>
					<ClassManagerPanelEmbedded
						onRequestClose={ jest.fn() }
						onExposeCloseAttempt={ ( cb ) => {
							attemptClose = cb;
						} }
					/>
				</QueryClientProvider>
			</ThemeProvider>,
			store
		);

		act( () => {
			attemptClose?.();
		} );

		const discardButton = screen.getByText( 'Discard' );
		fireEvent.click( discardButton );
		expect( slice.actions.resetToInitialState ).toHaveBeenCalledWith( { context: 'frontend' } );
		expect( store.getState().globalClasses.data.order ).toEqual( [ 'class-2', 'class-1' ] );
	} );

	it( 'should track classManagerSearched event when search field is focused', () => {
		// Act
		renderWithStore(
			<ThemeProvider>
				<QueryClientProvider client={ queryClient }>
					<ClassManagerPanelEmbedded onRequestClose={ jest.fn() } onExposeCloseAttempt={ jest.fn() } />
				</QueryClientProvider>
			</ThemeProvider>,
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
					<ClassManagerPanelEmbedded onRequestClose={ jest.fn() } onExposeCloseAttempt={ jest.fn() } />
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

		expect( loadExistingClasses ).toHaveBeenCalledWith( [ 'class-2' ] );
	} );

	it( 'should load existing class before enabling sync when class is not in store', async () => {
		// Arrange
		const unloadedClass = createMockStyleDefinition( { id: 'class-3', label: 'Class 3' } );

		jest.mocked( loadExistingClasses ).mockImplementation( async () => {
			act( () => {
				__dispatch(
					slice.actions.mergeExistingClasses( {
						preview: { [ unloadedClass.id ]: unloadedClass },
						frontend: { [ unloadedClass.id ]: unloadedClass },
					} )
				);
			} );
		} );

		act( () => {
			__dispatch(
				slice.actions.load( {
					frontend: { items: {}, order: [ unloadedClass.id ] },
					preview: { items: {}, order: [ unloadedClass.id ] },
					classLabels: { [ unloadedClass.id ]: unloadedClass.label },
				} )
			);
		} );

		// Act
		renderWithStore(
			<ThemeProvider>
				<QueryClientProvider client={ queryClient }>
					<ClassManagerPanelEmbedded onRequestClose={ jest.fn() } onExposeCloseAttempt={ jest.fn() } />
				</QueryClientProvider>
			</ThemeProvider>,
			store
		);

		const [ classItem ] = screen.getAllByRole( 'listitem' );

		fireEvent.click( within( classItem ).getByRole( 'button', { name: 'More actions' } ) );

		const startSyncButton = screen.getByRole( 'menuitem', { name: /Sync to Global Fonts/i } );

		fireEvent.click( startSyncButton );

		// Assert
		await waitFor( () => {
			expect( screen.getByRole( 'button', { name: 'Confirm sync' } ) ).toBeInTheDocument();
		} );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Confirm sync' } ) );

		// Assert
		await waitFor( () => {
			expect( loadExistingClasses ).toHaveBeenCalledWith( [ unloadedClass.id ] );
		} );

		const updatedClass = store.getState().globalClasses.data.items[ unloadedClass.id ];

		expect( updatedClass ).toMatchObject( {
			id: unloadedClass.id,
			label: unloadedClass.label,
			type: 'class',
			sync_to_v3: true,
			variants: unloadedClass.variants,
		} );
	} );
} );
