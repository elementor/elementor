import { syncStore } from '../';
import { Slice, createSlice } from '../../store';
import { ExtendedWindow, V1Document } from '../../types';
import { createStore, SliceState, Store } from '@elementor/store';
import {
	dispatchCommandAfter,
	dispatchCommandBefore,
	dispatchV1ReadyEvent,
	makeDocumentsManager,
	makeMockV1Document,
} from './test-utils';
import { selectActiveDocument } from '../../store/selectors';

type WindowWithOptionalElementor = Omit<ExtendedWindow, 'elementor'> & {
	elementor?: ExtendedWindow['elementor'];
}

describe( '@elementor/documents - Sync Store', () => {
	let store: Store<SliceState<Slice>>;
	let slice: Slice;

	beforeEach( () => {
		slice = createSlice();
		store = createStore();

		syncStore( slice );
	} );

	it( 'should sync documents on V1 load', () => {
		// Arrange.
		mockV1DocumentsManager( [
			makeMockV1Document( { id: 1 } ),
			makeMockV1Document( { id: 2 } ),
		] );

		// Act.
		dispatchV1ReadyEvent();

		// Assert.
		const storeState = store.getState();

		expect( storeState.documents.entities ).toEqual( {
			1: {
				id: 1,
				title: 'Document 1',
				type: {
					value: 'wp-page',
					label: 'WP-PAGE',
				},
				status: {
					value: 'publish',
					label: 'PUBLISH',
				},
				isDirty: false,
				isSaving: false,
				isSavingDraft: false,
				userCan: {
					publish: true,
				},
			},
			2: {
				id: 2,
				title: 'Document 2',
				type: {
					value: 'wp-page',
					label: 'WP-PAGE',
				},
				status: {
					value: 'publish',
					label: 'PUBLISH',
				},
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
	] )( 'should sync active document on $type', ( { dispatchEvent } ) => {
		// Arrange.
		mockV1DocumentsManager( [
			makeMockV1Document( { id: 1 } ),
			makeMockV1Document( { id: 2 } ),
		], 2 );

		// Act.
		dispatchEvent();

		// Assert.
		const currentDocument = selectActiveDocument( store.getState() );

		expect( currentDocument ).toEqual( {
			id: 2,
			title: 'Document 2',
			type: {
				value: 'wp-page',
				label: 'WP-PAGE',
			},
			status: {
				value: 'publish',
				label: 'PUBLISH',
			},
			isDirty: false,
			isSaving: false,
			isSavingDraft: false,
			userCan: {
				publish: true,
			},
		} );
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
		expect( selectActiveDocument( store.getState() )?.isSaving ).toBe( true );
	} );

	it( 'should sync saving state of a document on save', () => {
		// Arrange.
		mockV1DocumentsManager( [
			makeMockV1Document(),
		] );

		// Populate the documents state.
		dispatchV1ReadyEvent();

		// Assert - Default state.
		expect( selectActiveDocument( store.getState() )?.isSaving ).toBe( false );

		// Act.
		dispatchCommandBefore( 'document/save/save' );

		// Assert - On save start.
		expect( selectActiveDocument( store.getState() )?.isSaving ).toBe( true );
		expect( selectActiveDocument( store.getState() )?.isSavingDraft ).toBe( false );

		// Act.
		dispatchCommandAfter( 'document/save/save' );

		// Assert - On save end.
		expect( selectActiveDocument( store.getState() )?.isSaving ).toBe( false );
		expect( selectActiveDocument( store.getState() )?.isSavingDraft ).toBe( false );
	} );

	it( 'should sync draft saving state of a document on save', () => {
		// Arrange.
		mockV1DocumentsManager( [
			makeMockV1Document(),
		] );

		// Populate the documents state.
		dispatchV1ReadyEvent();

		// Assert - Default state.
		expect( selectActiveDocument( store.getState() )?.isSavingDraft ).toBe( false );

		// Act.
		dispatchCommandBefore( 'document/save/save', {
			status: 'autosave',
		} );

		// Assert - On save start.
		expect( selectActiveDocument( store.getState() )?.isSaving ).toBe( false );
		expect( selectActiveDocument( store.getState() )?.isSavingDraft ).toBe( true );

		// Act.
		dispatchCommandAfter( 'document/save/save', {
			status: 'autosave',
		} );

		// Assert - On save end.
		expect( selectActiveDocument( store.getState() )?.isSaving ).toBe( false );
		expect( selectActiveDocument( store.getState() )?.isSavingDraft ).toBe( false );
	} );

	it( 'should sync dirty state of a document when it has an autosave', () => {
		// Arrange.
		const mockDocument = makeMockV1Document( { id: 1 } );

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
		expect( selectActiveDocument( store.getState() )?.isDirty ).toBe( true );
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
		expect( selectActiveDocument( store.getState() )?.isDirty ).toBe( false );

		// Act.
		dispatchCommandAfter( 'document/save/set-is-modified' );

		// Assert - After change.
		expect( selectActiveDocument( store.getState() )?.isDirty ).toBe( true );

		// Emulate a save / undo action that flips the `isChanged` back to `false`.
		mockDocument.editor.isChanged = false;

		dispatchCommandAfter( 'document/save/set-is-modified' );

		// Assert - After change.
		expect( selectActiveDocument( store.getState() )?.isDirty ).toBe( false );
	} );

	it( 'should update the document when finish saving', () => {
		// Arrange.
		mockV1DocumentsManager( [
			makeMockV1Document( {
				id: 1,
				status: 'draft',
				title: 'test',
			} ),
		] );

		// Populate the documents state.
		dispatchV1ReadyEvent();

		// Mock a change.
		mockV1DocumentsManager( [
			makeMockV1Document( {
				id: 1,
				status: 'publish',
				title: 'test title changed',
			} ),
		] );

		// Assert.
		expect( selectActiveDocument( store.getState() )?.title ).toBe( 'test' );
		expect( selectActiveDocument( store.getState() )?.status.value ).toBe( 'draft' );

		// Act.
		dispatchCommandAfter( 'document/save/save' );

		// Assert.
		expect( selectActiveDocument( store.getState() )?.title ).toBe( 'test title changed' );
		expect( selectActiveDocument( store.getState() )?.status.value ).toBe( 'publish' );
	} );
} );

function mockV1DocumentsManager( documentsArray: V1Document[], current = 1 ) {
	( window as unknown as WindowWithOptionalElementor ).elementor = {
		documents: makeDocumentsManager( documentsArray, current ),
	};
}
