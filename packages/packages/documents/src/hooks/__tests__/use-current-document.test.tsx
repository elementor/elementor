import { Slice } from '../../types';
import { PropsWithChildren } from 'react';
import { createSlice } from '../../store';
import { renderHook } from '@testing-library/react-hooks';
import useCurrentDocument from '../use-current-document';
import { createStore, deleteStore, dispatch, SliceState, Store, StoreProvider } from '@elementor/store';

describe( '@elementor/documents/hooks/use-current-document', () => {
	let store: Store<SliceState<Slice>>;
	let slice: Slice;

	beforeEach( () => {
		slice = createSlice();
		store = createStore();
	} );

	afterEach( () => {
		deleteStore();
	} );

	it( 'should return the current document', () => {
		// Arrange.
		const mockDocument = {
			id: 1,
			title: 'Document 1',
			status: 'publish',
			isModified: false,
			isSaving: false,
			isSavingDraft: false,
			userCan: {
				publish: true,
			},
		};

		dispatch( slice.actions.setDocuments( {
			1: mockDocument,
		} ) );

		dispatch( slice.actions.setCurrentDocumentId( 1 ) );

		// Act.
		const { result } = renderHookWithProvider( useCurrentDocument, store );

		// Assert.
		expect( result.current ).toBe( mockDocument );
	} );

	it( 'should return null when the current document is not found', () => {
		// Arrange.
		dispatch( slice.actions.setCurrentDocumentId( 1 ) );

		// Act.
		const { result } = renderHookWithProvider( useCurrentDocument, store );

		// Assert.
		expect( result.current ).toBeNull();
	} );
} );

function renderHookWithProvider( hook: () => unknown, store: Store ) {
	const wrapper = ( { children }: PropsWithChildren<unknown> ) => (
		<StoreProvider store={ store }>
			{ children }
		</StoreProvider>
	);

	return renderHook( hook, {
		wrapper,
	} );
}
