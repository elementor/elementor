import { Slice } from '../../types';
import { PropsWithChildren } from 'react';
import { createSlice } from '../../store';
import { renderHook } from '@testing-library/react-hooks';
import useActiveDocument from '../use-active-document';
import { createStore, deleteStore, dispatch, SliceState, Store, StoreProvider } from '@elementor/store';

describe( '@elementor/documents - useActiveDocument', () => {
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
			status: 'publish' as const,
			type: 'wp-page;',
			isDirty: false,
			isSaving: false,
			isSavingDraft: false,
			userCan: {
				publish: true,
			},
		};

		dispatch( slice.actions.activateDocument( mockDocument ) );

		// Act.
		const { result } = renderHookWithStore( useActiveDocument, store );

		// Assert.
		expect( result.current ).toBe( mockDocument );
	} );

	it( 'should return null when the current document is not found', () => {
		// Act.
		const { result } = renderHookWithStore( useActiveDocument, store );

		// Assert.
		expect( result.current ).toBeNull();
	} );
} );

function renderHookWithStore( hook: () => unknown, store: Store ) {
	const wrapper = ( { children }: PropsWithChildren<unknown> ) => (
		<StoreProvider store={ store }>
			{ children }
		</StoreProvider>
	);

	return renderHook( hook, {
		wrapper,
	} );
}
