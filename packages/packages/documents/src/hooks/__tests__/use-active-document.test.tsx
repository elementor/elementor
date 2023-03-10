import { Slice, createSlice } from '../../store';
import useActiveDocument from '../use-active-document';
import { createStore, dispatch, SliceState, Store } from '@elementor/store';
import { renderHookWithStore } from './test-utils';
import { createMockDocument } from 'test-utils';

describe( '@elementor/documents - useActiveDocument', () => {
	let store: Store<SliceState<Slice>>;
	let slice: Slice;

	beforeEach( () => {
		slice = createSlice();
		store = createStore();
	} );

	it( 'should return the current document', () => {
		// Arrange.
		const mockDocument = createMockDocument();

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
