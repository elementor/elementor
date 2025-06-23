import { createMockDocument, renderHookWithStore } from 'test-utils';
import { __createStore, __dispatch, __registerSlice, type SliceState, type Store } from '@elementor/store';

import { slice } from '../../store';
import useHostDocument from '../use-host-document';

describe( '@elementor/editor-documents - useHostDocument', () => {
	const mockDocument = createMockDocument();

	let store: Store< SliceState< typeof slice > >;

	beforeEach( () => {
		__registerSlice( slice );
		store = __createStore();
	} );

	it( 'should return the host document', () => {
		// Arrange.
		__dispatch(
			slice.actions.init( {
				entities: { [ mockDocument.id ]: mockDocument },
				activeId: null,
				hostId: mockDocument.id,
			} )
		);

		// Act.
		const { result } = renderHookWithStore( useHostDocument, store );

		// Assert.
		expect( result.current ).toEqual( expect.objectContaining( { id: mockDocument.id } ) );
	} );

	it( 'should return null when the host document is not found', () => {
		// Arrange.
		__dispatch(
			slice.actions.init( {
				entities: { [ mockDocument.id ]: mockDocument },
				activeId: null,
				hostId: null,
			} )
		);

		// Act.
		const { result } = renderHookWithStore( useHostDocument, store );

		// Assert.
		expect( result.current ).toBeNull();
	} );
} );
