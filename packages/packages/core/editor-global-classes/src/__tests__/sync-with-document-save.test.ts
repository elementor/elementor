import { createMockStyleDefinition } from 'test-utils';
import { getCurrentUser } from '@elementor/editor-current-user';
import { __privateRunCommandSync as runCommandSync, registerDataHook } from '@elementor/editor-v1-adapters';
import {
	__createStore as createStore,
	__dispatch as dispatch,
	__getState as getState,
	__registerSlice as registerSlice,
} from '@elementor/store';

import { apiClient } from '../api';
import { UPDATE_CLASS_CAPABILITY_KEY } from '../capabilities';
import { selectFrontendInitialData, selectIsDirty, selectPreviewInitialData, slice } from '../store';
import { syncWithDocumentSave } from '../sync-with-document-save';

jest.mock( '@elementor/editor-v1-adapters' );
jest.mock( '../api' );
jest.mock( '@elementor/editor-current-user' );

describe( 'syncWithDocumentSave', () => {
	beforeEach( () => {
		registerSlice( slice );

		createStore();

		jest.mocked( getCurrentUser ).mockReturnValue( {
			capabilities: [ UPDATE_CLASS_CAPABILITY_KEY ],
		} as never );
	} );

	it( 'should sync global classes dirty state with the document dirty state', () => {
		// Arrange.
		const unsubscribe = syncWithDocumentSave();

		// Act.
		const styleDefinition = createMockStyleDefinition();

		dispatch( slice.actions.add( styleDefinition ) );

		// Assert.
		expect( runCommandSync ).toHaveBeenCalledTimes( 1 );

		expect( runCommandSync ).toHaveBeenCalledWith(
			'document/save/set-is-modified',
			{ status: true },
			{ internal: true }
		);

		// Cleanup.
		unsubscribe();
	} );

	it.each( [ 'publish', 'draft', 'unknown' ] )(
		'should save global classes when saving the document',
		async ( status ) => {
			// Arrange.
			const triggerHook = mockRegisterDataHook();

			const unsubscribe = syncWithDocumentSave();

			const styleDefinition = createMockStyleDefinition();

			dispatch( slice.actions.add( styleDefinition ) );

			// Act.
			await triggerHook( 'dependency', 'document/save/save', { status } );

			// Assert.
			const method = status === 'publish' ? apiClient.publish : apiClient.saveDraft;

			expect( method ).toHaveBeenCalledTimes( 1 );
			expect( method ).toHaveBeenCalledWith( {
				items: {
					[ styleDefinition.id ]: styleDefinition,
				},
				order: [ styleDefinition.id ],
				changes: {
					added: [ styleDefinition.id ],
					deleted: [],
					modified: [],
				},
			} );

			const isPublish = status === 'publish';

			const newState = {
				items: {
					[ styleDefinition.id ]: styleDefinition,
				},
				order: [ styleDefinition.id ],
			};

			expect( selectIsDirty( getState() ) ).toBe( ! isPublish );
			expect( selectPreviewInitialData( getState() ) ).toEqual( newState );
			expect( selectFrontendInitialData( getState() ) ).toEqual(
				isPublish ? newState : { items: {}, order: [] }
			);

			// Cleanup.
			unsubscribe();
		}
	);

	it( 'should not save global classes when the user does not have the capability', async () => {
		// Arrange.
		const triggerHook = mockRegisterDataHook();

		jest.mocked( getCurrentUser ).mockReturnValue( {
			capabilities: [],
		} as never );

		const unsubscribe = syncWithDocumentSave();

		const styleDefinition = createMockStyleDefinition();

		dispatch( slice.actions.add( styleDefinition ) );

		// Act.
		await triggerHook( 'dependency', 'document/save/save', { status: 'publish' } );

		// Assert.
		expect( apiClient.publish ).not.toHaveBeenCalled();

		expect( selectIsDirty( getState() ) ).toBe( true );
		expect( selectPreviewInitialData( getState() ) ).toEqual( {
			items: {},
			order: [],
		} );
		expect( selectFrontendInitialData( getState() ) ).toEqual( {
			items: {},
			order: [],
		} );

		unsubscribe();
	} );
} );

function mockRegisterDataHook() {
	const callbacks = new Map< string, ( args: Record< string, unknown >, result?: unknown ) => unknown >();

	jest.mocked( registerDataHook ).mockImplementation( ( type, command, callback ) => {
		const key = `${ command }-${ type }`;

		if ( callbacks.get( key ) ) {
			throw new Error( 'Already registered' );
		}

		callbacks.set( key, callback );

		return {} as never;
	} );

	return ( type: string, command: string, args: Record< string, unknown > = {}, result: unknown = undefined ) => {
		const key = `${ command }-${ type }`;

		const callback = callbacks.get( key );

		callbacks.delete( key );

		return callback?.( args, result );
	};
}
