import { syncStore } from '../';
import { createSlice } from '../../store';
import { ExtendedWindow, Slice, V1Document } from '../../types';
import { flushListeners } from '@elementor/v1-adapters';
import { createStore, deleteStore, SliceState, Store } from '@elementor/store';
import {
	dispatchCommandAfter,
	dispatchCommandBefore,
	dispatchV1ReadyEvent,
	makeDocumentsManager,
	makeMockV1Document,
	makeV1Settings,
} from './test-utils';
import { selectActiveDocument } from '../../store/selectors';

type WindowWithOptionalElementor = Omit<ExtendedWindow, 'elementor'> & {
	elementor?: ExtendedWindow['elementor'];
}

describe( '@elementor/documents - Sync Store', () => {
	let store: Store<SliceState<Slice>>;
	let slice: Slice;
	let extendedWindow: WindowWithOptionalElementor;

	beforeEach( () => {
		slice = createSlice();
		store = createStore();

		syncStore( slice );

		extendedWindow = ( window as unknown as WindowWithOptionalElementor );
	} );

	afterEach( () => {
		delete extendedWindow.elementor;

		flushListeners();
		deleteStore();
	} );

	it( 'should sync documents on V1 load', () => {
		// Arrange.
		mockV1DocumentsManager( [
			makeMockV1Document( 1 ),
			makeMockV1Document( 2 ),
		] );

		// Act.
		dispatchV1ReadyEvent();

		// Assert.
		const storeState = store.getState();

		expect( storeState.documents.entities ).toEqual( {
			1: {
				id: 1,
				type: 'wp-page;',
				title: 'Document 1',
				status: 'publish',
				isDirty: false,
				isSaving: false,
				isSavingDraft: false,
				userCan: {
					publish: true,
				},
			},
			2: {
				id: 2,
				type: 'wp-page;',
				title: 'Document 2',
				status: 'publish',
				isDirty: false,
				isSaving: false,
				isSavingDraft: false,
				userCan: {
					publish: true,
				},
			},
		} );
	} );

	it.each( [
		{
			type: 'V1 load',
			dispatchEvent: () => dispatchV1ReadyEvent(),
		},
		{
			type: 'document open',
			dispatchEvent: () => dispatchCommandAfter( 'editor/documents/open' ),
		},
	] )( 'should sync current document on $type', ( { dispatchEvent } ) => {
		// Arrange.
		mockV1DocumentsManager( [
			makeMockV1Document( 1 ),
			makeMockV1Document( 2 ),
		], 2 );

		// Act.
		dispatchEvent();

		// Assert.
		const currentDocument = selectActiveDocument( store.getState() );

		expect( currentDocument.id ).toBe( 2 );
		expect( currentDocument ).toEqual( {
			id: 2,
			title: 'Document 2',
			status: 'publish',
			type: 'wp-page;',
			isDirty: false,
			isSaving: false,
			isSavingDraft: false,
			userCan: {
				publish: true,
			},
		} );
	} );

	it( 'should normalize `undefined` status to `pending`', () => {
		// Arrange.
		const mockDocument = makeMockV1Document();

		mockV1DocumentsManager( [ {
			...mockDocument,
			container: {
				settings: makeV1Settings( {
					post_title: 'Document 1',
					post_status: undefined,
				} ),
			},
		} ] );

		// Act.
		dispatchV1ReadyEvent();

		// Assert.
		expect( selectActiveDocument( store.getState() ).status ).toBe( 'pending' );
	} );

	it( 'should sync saving state of a document on V1 load', () => {
		// Arrange.
		const mockDocument = makeMockV1Document();

		mockV1DocumentsManager( [
			{
				...mockDocument,
				editor: {
					...mockDocument.editor,
					isSaving: true,
				},
			},
		] );

		// Act.
		dispatchV1ReadyEvent();

		// Assert.
		expect( selectActiveDocument( store.getState() ).isSaving ).toBe( true );
	} );

	it( 'should sync saving state of a document on save', () => {
		// Arrange.
		mockV1DocumentsManager( [
			makeMockV1Document(),
		] );

		// Populate the documents state.
		dispatchV1ReadyEvent();

		// Assert - Default state.
		expect( selectActiveDocument( store.getState() ).isSaving ).toBe( false );

		// Act.
		dispatchCommandBefore( 'document/save/save' );

		// Assert - On save start.
		expect( selectActiveDocument( store.getState() ).isSaving ).toBe( true );
		expect( selectActiveDocument( store.getState() ).isSavingDraft ).toBe( false );

		// Act.
		dispatchCommandAfter( 'document/save/save' );

		// Assert - On save end.
		expect( selectActiveDocument( store.getState() ).isSaving ).toBe( false );
		expect( selectActiveDocument( store.getState() ).isSavingDraft ).toBe( false );
	} );

	it( 'should sync draft saving state of a document on save', () => {
		// Arrange.
		mockV1DocumentsManager( [
			makeMockV1Document(),
		] );

		// Populate the documents state.
		dispatchV1ReadyEvent();

		// Assert - Default state.
		expect( selectActiveDocument( store.getState() ).isSavingDraft ).toBe( false );

		// Act.
		dispatchCommandBefore( 'document/save/save', {
			status: 'autosave',
		} );

		// Assert - On save start.
		expect( selectActiveDocument( store.getState() ).isSaving ).toBe( false );
		expect( selectActiveDocument( store.getState() ).isSavingDraft ).toBe( true );

		// Act.
		dispatchCommandAfter( 'document/save/save', {
			status: 'autosave',
		} );

		// Assert - On save end.
		expect( selectActiveDocument( store.getState() ).isSaving ).toBe( false );
		expect( selectActiveDocument( store.getState() ).isSavingDraft ).toBe( false );
	} );

	it( 'should sync dirty state of a document when it has an autosave', () => {
		// Arrange.
		const mockDocument = makeMockV1Document();

		mockV1DocumentsManager( [ {
			...mockDocument,
			config: {
				...mockDocument.config,
				revisions: {
					current_id: 2,
				},
			},
		} ] );

		// Act.
		dispatchV1ReadyEvent();

		// Assert.
		expect( selectActiveDocument( store.getState() ).isDirty ).toBe( true );
	} );

	it( 'should sync dirty state of a document on document change', () => {
		// Arrange.
		const mockDocument = makeMockV1Document();

		mockV1DocumentsManager( [
			mockDocument,
		] );

		// Populate the documents state.
		dispatchV1ReadyEvent();

		// Mock a change.
		mockDocument.editor.isChanged = true;

		// Assert - Default state.
		expect( selectActiveDocument( store.getState() ).isDirty ).toBe( false );

		// Act.
		dispatchCommandAfter( 'document/save/set-is-modified' );

		// Assert - After change.
		expect( selectActiveDocument( store.getState() ).isDirty ).toBe( true );

		// Emulate a save / undo action that flips the `isChanged` back to `false`.
		mockDocument.editor.isChanged = false;

		dispatchCommandAfter( 'document/save/set-is-modified' );

		// Assert - After change.
		expect( selectActiveDocument( store.getState() ).isDirty ).toBe( false );
	} );
} );

function mockV1DocumentsManager( documentsArray: V1Document[], current = 1 ) {
	( window as unknown as WindowWithOptionalElementor ).elementor = {
		documents: makeDocumentsManager( documentsArray, current ),
	};
}
