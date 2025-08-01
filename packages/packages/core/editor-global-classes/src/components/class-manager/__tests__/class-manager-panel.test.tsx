import * as React from 'react';
import { createMockDocument, createMockStyleDefinition, dispatchDependencyCommand, renderWithStore } from 'test-utils';
import { getCurrentDocument, getV1DocumentsManager } from '@elementor/editor-documents';
import { __privateRunCommand } from '@elementor/editor-v1-adapters';
import { QueryClient, QueryClientProvider } from '@elementor/query';
import { __createStore, __dispatch, __registerSlice, type SliceState, type Store } from '@elementor/store';
import { ThemeProvider } from '@elementor/ui';
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';

import { apiClient } from '../../../api';
import { slice } from '../../../store';
import { ClassManagerPanel, usePanelActions } from '../class-manager-panel';

jest.mock( '@elementor/editor-documents' );
jest.mock( '../class-manager-introduction' );

jest.mock( '../../../api', () => ( {
	apiClient: { all: jest.fn(), publish: jest.fn() },
} ) );

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	...jest.requireActual( '@elementor/editor-v1-adapters' ),
	__privateRunCommand: jest.fn(),
} ) );

jest.mock( '@elementor/editor-panels', () => ( {
	...jest.requireActual( '@elementor/editor-panels' ),
	__createPanel: jest.fn().mockReturnValue( {
		usePanelActions: jest.fn( () => ( {} ) ),
	} ),
} ) );

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
	} );

	it( 'should have a disabled "save changes" button when dirty state is false', () => {
		// Act.
		renderWithStore(
			<ThemeProvider>
				<QueryClientProvider client={ queryClient }>
					<ClassManagerPanel />
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
				<ClassManagerPanel />
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
				<ClassManagerPanel />
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
				<ClassManagerPanel />
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

	it( 'should show a dialog when trying to close with unsaved changes, and allow to cancel the action', () => {
		// Arrange.
		const close = jest.fn();
		jest.mocked( usePanelActions ).mockReturnValue( { close, open: jest.fn() } );

		// Act.
		renderWithStore(
			<QueryClientProvider client={ queryClient }>
				<ClassManagerPanel />
			</QueryClientProvider>,
			store
		);

		act( () => {
			__dispatch( slice.actions.setOrder( [ 'class-1', 'class-2' ] ) );
		} );

		const closeButton = screen.getByRole( 'button', { name: 'Close' } );

		fireEvent.click( closeButton );

		// Assert.
		expect( screen.getByText( 'You have unsaved changes' ) ).toBeInTheDocument();
		expect( close ).not.toHaveBeenCalled();

		// Act.
		fireEvent.click( screen.getByRole( 'button', { name: 'close' } ) );

		// Assert.
		expect( close ).not.toHaveBeenCalled();
	} );

	it( 'should show a dialog when trying to close with unsaved changes, and allow to save and continue', async () => {
		// Arrange.
		const close = jest.fn();
		jest.mocked( usePanelActions ).mockReturnValue( { close, open: jest.fn() } );

		// Act.
		renderWithStore(
			<QueryClientProvider client={ queryClient }>
				<ClassManagerPanel />
			</QueryClientProvider>,
			store
		);

		act( () => {
			__dispatch( slice.actions.setOrder( [ 'class-1', 'class-2' ] ) );
		} );

		const closeButton = screen.getByRole( 'button', { name: 'Close' } );

		fireEvent.click( closeButton );

		// Assert.
		expect( screen.getByText( 'You have unsaved changes' ) ).toBeInTheDocument();
		expect( close ).not.toHaveBeenCalled();

		// Act.
		const saveAndContinueButton = screen.getByRole( 'button', { name: 'Save & Continue' } );

		fireEvent.click( saveAndContinueButton );

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

		await waitFor( () => {
			expect( close ).toHaveBeenCalled();
		} );
	} );

	it( 'should not show the dialog when trying to close with no unsaved changes', () => {
		// Arrange.
		const close = jest.fn();
		jest.mocked( usePanelActions ).mockReturnValue( { close, open: jest.fn() } );

		// Act.
		renderWithStore(
			<QueryClientProvider client={ queryClient }>
				<ClassManagerPanel />
			</QueryClientProvider>,
			store
		);

		const closeButton = screen.getByRole( 'button', { name: 'Close' } );

		fireEvent.click( closeButton );

		// Assert.
		expect( screen.queryByText( 'You have unsaved changes' ) ).not.toBeInTheDocument();
		expect( close ).toHaveBeenCalled();
	} );

	it( 'should show the browser alert when trying to close with unsaved changes', () => {
		// Act.
		renderWithStore(
			<QueryClientProvider client={ queryClient }>
				<ClassManagerPanel />
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
				<ClassManagerPanel />
			</QueryClientProvider>,
			store
		);

		// Assert.
		expect( window.onbeforeunload ).toBeNull();
	} );

	it( 'should reload the current document after deleting classes and saving the change.', async () => {
		// Arrange.

		const invalidateCache = jest.fn();
		jest.mocked( getV1DocumentsManager ).mockReturnValue( { invalidateCache } as never );

		// Act.
		renderWithStore(
			<ThemeProvider>
				<QueryClientProvider client={ queryClient }>
					<ClassManagerPanel />
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

		// Assert.
		await waitFor( () => {
			expect( invalidateCache ).toHaveBeenCalled();
		} );

		expect( __privateRunCommand ).toHaveBeenCalledWith( 'editor/documents/switch', {
			id: 1,
			shouldScroll: false,
			shouldNavigateToDefaultRoute: false,
		} );
	} );

	it( 'should not reload the current if the changes did not contain any deletions', async () => {
		// Act.
		renderWithStore(
			<ThemeProvider>
				<QueryClientProvider client={ queryClient }>
					<ClassManagerPanel />
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

		fireEvent.keyDown( editableField as Element, { key: 'Enter' } );

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
					<ClassManagerPanel />
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
} );
