import { Slice, createSlice } from '../../store';
import { createStore, dispatch, SliceState, Store } from '@elementor/store';
import useHostDocument from '../use-host-document';
import { renderHookWithStore } from './test-utils';
import { createMockDocument } from 'test-utils';

describe( '@elementor/documents - useHostDocument', () => {
	const mockDocument = createMockDocument();

	let store: Store<SliceState<Slice>>;
	let slice: Slice;

	beforeEach( () => {
		slice = createSlice();
		store = createStore();
	} );

	it( 'should return the host document', () => {
		// Arrange.
		dispatch( slice.actions.init( {
			entities: { [ mockDocument.id ]: mockDocument },
			activeId: null,
			hostId: mockDocument.id,
		} ) );

		// Act.
		const { result } = renderHookWithStore( useHostDocument, store );

		// Assert.
		expect( result.current ).toEqual( expect.objectContaining( { id: mockDocument.id } ) );
	} );

	it( 'should return null when the host document is not found', () => {
		// Arrange.
		dispatch( slice.actions.init( {
			entities: { [ mockDocument.id ]: mockDocument },
			activeId: null,
			hostId: null,
		} ) );

		// Act.
		const { result } = renderHookWithStore( useHostDocument, store );

		// Assert.
		expect( result.current ).toBeNull();
	} );
} );
