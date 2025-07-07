import { dispatchCommandAfter, dispatchCommandBefore, dispatchV1ReadyEvent } from 'test-utils';
import { __createStore, __registerSlice, type SliceState, type Store } from '@elementor/store';

import { slice } from '../../store';
import { selectActiveDocument } from '../../store/selectors';
import { type Document, type ExitTo, type ExtendedWindow, type V1Document } from '../../types';
import { syncStore } from '../index';
import { getV1DocumentPermalink, getV1DocumentsExitTo } from '../utils';
import { makeDocumentsManager, makeMockV1Document } from './test-utils';

type WindowWithOptionalElementor = Omit< ExtendedWindow, 'elementor' > & {
	elementor?: ExtendedWindow[ 'elementor' ];
};

describe( '@elementor/editor-documents - Sync Store', () => {
	let store: Store< SliceState< typeof slice > >;

	beforeEach( () => {
		jest.useFakeTimers();

		__registerSlice( slice );
		store = __createStore();

		syncStore();
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	it( 'should sync documents on V1 load', () => {
		// Arrange.
		mockV1DocumentsManager( [ makeMockV1Document( { id: 1 } ), makeMockV1Document( { id: 2 } ) ], 'this_post' );

		// Act.
		dispatchV1ReadyEvent();

		// Assert.
		const storeState = store.getState();

		expect( storeState.documents.entities ).toEqual< Record< number, Document > >( {
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
				links: {
					platformEdit: 'https://localhost/wp-admin/post.php?post=1&action=edit',
					permalink: 'https://localhost/?p=1',
				},
				isDirty: false,
				isSaving: false,
				isSavingDraft: false,
				userCan: {
					publish: true,
				},
				permissions: {
					allowAddingWidgets: true,
					showCopyAndShare: false,
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
				links: {
					platformEdit: 'https://localhost/wp-admin/post.php?post=2&action=edit',
					permalink: 'https://localhost/?p=2',
				},
				isDirty: false,
				isSaving: false,
				isSavingDraft: false,
				userCan: {
					publish: true,
				},
				permissions: {
					allowAddingWidgets: true,
					showCopyAndShare: false,
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
		mockV1DocumentsManager( [ makeMockV1Document( { id: 1 } ), makeMockV1Document( { id: 2 } ) ], 'this_post', 2 );

		// Act.
		dispatchEvent();

		// Assert.
		const currentDocument = selectActiveDocument( store.getState() );

		expect( currentDocument ).toEqual< Document >( {
			id: 2,
			title: 'Document 2',
			type: {
				value: 'wp-page',
				label: 'WP-PAGE',
			},
			links: {
				platformEdit: 'https://localhost/wp-admin/post.php?post=2&action=edit',
				permalink: 'https://localhost/?p=2',
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
			permissions: {
				allowAddingWidgets: true,
				showCopyAndShare: false,
			},
		} );
	} );

	it.each( [
		{
			openAsHost: true,
			expectedHost: 2,
		},
		{
			openAsHost: false,
			expectedHost: 1,
		},
	] )(
		'should sync host document when a new host is opened { openAsHost: $openAsHost }',
		( { openAsHost, expectedHost } ) => {
			// Arrange.
			const mockDocument1 = makeMockV1Document( { id: 1 } );
			const mockDocument2 = makeMockV1Document( { id: 2 } );

			mockV1DocumentsManager( [ mockDocument1, mockDocument2 ], 'this_post', 1, 1 );

			// Populate the documents state.
			dispatchV1ReadyEvent();

			// Act - Mock a host document change.
			mockV1DocumentsManager( [ mockDocument1, mockDocument2 ], 'this_post', 2, openAsHost ? 2 : 1 );

			dispatchCommandAfter( 'editor/documents/open' );

			// Assert.
			expect( store.getState().documents.hostId ).toBe( expectedHost );
		}
	);

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
		mockV1DocumentsManager( [ makeMockV1Document() ] );

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
		mockV1DocumentsManager( [ makeMockV1Document() ] );

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

		mockV1DocumentsManager( [
			{
				...mockDocument,
				config: {
					...mockDocument.config,
					revisions: {
						current_id: 2,
					},
				},
			},
		] );

		// Act.
		dispatchV1ReadyEvent();

		// Assert.
		expect( selectActiveDocument( store.getState() )?.isDirty ).toBe( true );
	} );

	it( 'should sync dirty state of a document on document change', () => {
		// Arrange.
		const mockDocument = makeMockV1Document();

		mockV1DocumentsManager( [ mockDocument ] );

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

	it( "should not sync dirty state of a document when it's being saved", () => {
		// Arrange.
		const mockDocument = makeMockV1Document();

		mockV1DocumentsManager( [ mockDocument ] );

		// Populate the documents state.
		dispatchV1ReadyEvent();

		// Mock dirty state while document is being saved.
		mockDocument.editor.isChanged = true;
		dispatchCommandBefore( 'document/save/save' );

		// Act.
		dispatchCommandAfter( 'document/save/set-is-modified' );

		// Assert.
		expect( selectActiveDocument( store.getState() )?.isDirty ).toBe( false );
	} );

	it( 'should sync document title on V1 setting change', () => {
		// Arrange.
		mockV1DocumentsManager( [
			makeMockV1Document( {
				title: 'old title',
			} ),
		] );

		// Populate the documents state.
		dispatchV1ReadyEvent();

		// Act - simulate a change.
		mockV1DocumentsManager( [
			makeMockV1Document( {
				title: 'new title',
			} ),
		] );

		dispatchCommandAfter( 'document/elements/settings', {
			settings: {
				post_title: 'new title',
			},
		} );

		jest.runAllTimers();

		// Assert.
		expect( selectActiveDocument( store.getState() )?.title ).toBe( 'new title' );
	} );

	it( 'should not sync document title when a non-related V1 setting has changed', () => {
		// Arrange.
		mockV1DocumentsManager( [
			makeMockV1Document( {
				title: 'old title',
			} ),
		] );

		// Populate the documents state.
		dispatchV1ReadyEvent();

		// Act - simulate a change.
		dispatchCommandAfter( 'document/elements/settings', {
			settings: {
				nonRelated: 'value',
			},
		} );

		jest.runAllTimers();

		// Assert.
		expect( selectActiveDocument( store.getState() )?.title ).toBe( 'old title' );
	} );

	it( 'should update the document when finish saving', () => {
		// Arrange.
		mockV1DocumentsManager(
			[
				makeMockV1Document( {
					id: 1,
					status: 'draft',
					title: 'test',
				} ),
			],
			'this_post'
		);

		// Populate the documents state.
		dispatchV1ReadyEvent();

		// Mock a change.
		mockV1DocumentsManager(
			[
				makeMockV1Document( {
					id: 1,
					status: 'publish',
					title: 'test title changed',
				} ),
			],
			'dashboard'
		);

		// Assert.
		expect( selectActiveDocument( store.getState() )?.title ).toBe( 'test' );
		expect( selectActiveDocument( store.getState() )?.status.value ).toBe( 'draft' );
		expect( selectActiveDocument( store.getState() )?.links.platformEdit ).toBe(
			'https://localhost/wp-admin/post.php?post=1&action=edit'
		);

		// Act.
		dispatchCommandAfter( 'document/save/save' );

		// Assert.
		expect( selectActiveDocument( store.getState() )?.title ).toBe( 'test title changed' );
		expect( selectActiveDocument( store.getState() )?.status.value ).toBe( 'publish' );
		expect( selectActiveDocument( store.getState() )?.links.platformEdit ).toBe( 'https://localhost/wp-admin/' );
	} );

	it.each( [ 'dashboard', 'this_post', 'all_posts' ] as ExitTo[] )(
		'should sync active document $ExitTo',
		( exitTo ) => {
			// Arrange.
			const mockDocument = makeMockV1Document( { id: 1 } );
			mockV1DocumentsManager( [ mockDocument ], exitTo );

			// Populate the documents state.
			dispatchV1ReadyEvent();

			// Assert.
			const currentDocument = selectActiveDocument( store.getState() );
			const platformEdit = getV1DocumentsExitTo( mockDocument );
			const permalink = getV1DocumentPermalink( mockDocument );

			expect( currentDocument ).toEqual< Document >( {
				id: 1,
				title: 'Document 1',
				type: {
					value: 'wp-page',
					label: 'WP-PAGE',
				},
				links: {
					platformEdit,
					permalink,
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
				permissions: {
					allowAddingWidgets: true,
					showCopyAndShare: false,
				},
			} );
		}
	);
} );

function mockV1DocumentsManager(
	documentsArray: V1Document[],
	exitTo: ExitTo = 'this_post',
	current = 1,
	initial = 1
) {
	( window as unknown as WindowWithOptionalElementor ).elementor = {
		getPreferences: () => exitTo,
		documents: makeDocumentsManager( documentsArray, current, initial ),
	};
}
