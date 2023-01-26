import { syncStore } from '../sync';
import { createSlice } from '../store';
import { ExtendedWindow, Slice } from '../../types';
import { flushListeners } from '@elementor/v1-adapters';
import { createStore, deleteStore, SliceState, Store } from '@elementor/store';
import {
	dispatchCommandAfter,
	dispatchCommandBefore,
	dispatchV1ReadyEvent,
	makeDocumentsManager,
	makeMockDocument,
} from './test-utils';

type WindowWithV1Loading = Omit<ExtendedWindow, 'elementor'> & {
	__elementorEditorV1LoadingPromise?: Promise<void>;
	elementor?: ExtendedWindow['elementor'];
}

describe( '@elementor/documents/store/sync', () => {
	let store: Store<SliceState<Slice>>;
	let slice: Slice;
	let extendedWindow: WindowWithV1Loading;

	beforeEach( () => {
		slice = createSlice();
		store = createStore();

		syncStore( slice );

		extendedWindow = ( window as unknown as WindowWithV1Loading );
		extendedWindow.__elementorEditorV1LoadingPromise = Promise.resolve();
	} );

	afterEach( () => {
		delete extendedWindow.__elementorEditorV1LoadingPromise;
		delete extendedWindow.elementor;

		flushListeners();
		deleteStore();
	} );

	it( 'should sync documents on V1 load', () => {
		// Arrange.
		extendedWindow.elementor = {
			documents: makeDocumentsManager( [
				makeMockDocument( 1 ),
				makeMockDocument( 2 ),
			] ),
		};

		// Act.
		dispatchV1ReadyEvent();

		// Assert.
		const storeState = store.getState();

		expect( storeState.documents.documents ).toEqual( {
			1: {
				id: 1,
				title: 'Document 1',
				status: 'publish',
				isModified: false,
				isSaving: false,
				isSavingDraft: false,
				userCan: {
					publish: true,
				},
			},
			2: {
				id: 2,
				title: 'Document 2',
				status: 'publish',
				isModified: false,
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
		extendedWindow.elementor = {
			documents: makeDocumentsManager( [
				makeMockDocument( 1 ),
				makeMockDocument( 2 ),
			], 2 ),
		};

		// Act.
		dispatchEvent();

		// Assert.
		const storeState = store.getState();
		const { currentDocumentId } = storeState.documents;
		const currentDocument = storeState.documents.documents[ currentDocumentId ];

		expect( currentDocumentId ).toBe( 2 );
		expect( currentDocument ).toEqual( {
			id: 2,
			title: 'Document 2',
			status: 'publish',
			isModified: false,
			isSaving: false,
			isSavingDraft: false,
			userCan: {
				publish: true,
			},
		} );
	} );

	it( 'should sync saving state of a document on V1 load', () => {
		// Arrange.
		const mockDocument = makeMockDocument();

		extendedWindow.elementor = {
			documents: makeDocumentsManager( [
				{
					...mockDocument,
					editor: {
						...mockDocument.editor,
						isSaving: true,
					},
				},
			] ),
		};

		// Act.
		dispatchV1ReadyEvent();

		// Assert.
		const storeState = store.getState();
		const { currentDocumentId } = storeState.documents;
		const currentDocument = storeState.documents.documents[ currentDocumentId ];

		expect( currentDocument.isSaving ).toBe( true );
	} );

	it( 'should sync saving state of a document on save', () => {
		// Arrange.
		extendedWindow.elementor = {
			documents: makeDocumentsManager( [
				makeMockDocument(),
			] ),
		};

		// Populate the documents state.
		dispatchV1ReadyEvent();

		const getCurrentDocument = () => {
			const storeState = store.getState();
			const { currentDocumentId } = storeState.documents;

			return storeState.documents.documents[ currentDocumentId ];
		};

		// Act.
		dispatchCommandBefore( 'document/save/save' );

		// Assert.
		expect( getCurrentDocument().isSaving ).toBe( true );
		expect( getCurrentDocument().isSavingDraft ).toBe( false );

		// Act.
		dispatchCommandAfter( 'document/save/save' );

		// Assert.
		expect( getCurrentDocument().isSaving ).toBe( false );
		expect( getCurrentDocument().isSavingDraft ).toBe( false );
	} );

	it( 'should sync draft saving state of a document on save', () => {
		// Arrange.
		extendedWindow.elementor = {
			documents: makeDocumentsManager( [
				makeMockDocument(),
			] ),
		};

		// Populate the documents state.
		dispatchV1ReadyEvent();

		const getCurrentDocument = () => {
			const storeState = store.getState();
			const { currentDocumentId } = storeState.documents;

			return storeState.documents.documents[ currentDocumentId ];
		};

		// Act.
		dispatchCommandBefore( 'document/save/save', {
			status: 'autosave',
		} );

		// Assert.
		expect( getCurrentDocument().isSaving ).toBe( false );
		expect( getCurrentDocument().isSavingDraft ).toBe( true );

		// Act.
		dispatchCommandAfter( 'document/save/save', {
			status: 'autosave',
		} );

		// Assert.
		expect( getCurrentDocument().isSaving ).toBe( false );
		expect( getCurrentDocument().isSavingDraft ).toBe( false );
	} );

	it( 'should sync modified state of a document on V1 load', () => {
		// Arrange.
		const mockDocument = makeMockDocument();

		extendedWindow.elementor = {
			documents: makeDocumentsManager( [ {
				...mockDocument,
				config: {
					...mockDocument.config,
					revisions: {
						current_id: 2,
					},
				},
			} ] ),
		};

		// Act.
		dispatchV1ReadyEvent();

		// Assert.
		const storeState = store.getState();
		const { currentDocumentId } = storeState.documents;
		const currentDocument = storeState.documents.documents[ currentDocumentId ];

		expect( currentDocument.isModified ).toBe( true );
	} );

	it( 'should sync modified state of a document on document change', () => {
		// Arrange.
		const mockDocument = makeMockDocument();

		extendedWindow.elementor = {
			documents: makeDocumentsManager( [
				mockDocument,
			] ),
		};

		// Populate the documents state.
		dispatchV1ReadyEvent();

		// Mock a change.
		extendedWindow.elementor = {
			documents: makeDocumentsManager( [ {
				...mockDocument,
				editor: {
					...mockDocument.editor,
					isChanged: true,
				},
			} ] ),
		};

		// Act.
		dispatchCommandAfter( 'document/save/set-is-modified' );

		// Assert.
		const storeState = store.getState();
		const { currentDocumentId } = storeState.documents;
		const currentDocument = storeState.documents.documents[ currentDocumentId ];

		expect( currentDocument.isModified ).toBe( true );
	} );
} );

