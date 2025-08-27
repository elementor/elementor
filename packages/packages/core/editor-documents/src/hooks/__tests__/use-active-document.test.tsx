import { createMockDocument, renderHookWithStore } from 'test-utils';
import { __createStore, __dispatch, __registerSlice, type SliceState, type Store } from '@elementor/store';

import { slice } from '../../store';
import useActiveDocument from '../use-active-document';

describe( '@elementor/editor-documents - useActiveDocument', () => {
	let store: Store< SliceState< typeof slice > >;

	beforeEach( () => {
		__registerSlice( slice );
		store = __createStore();
	} );

	it( 'should return the current document', () => {
		// Arrange.
		const mockDocument = createMockDocument();

		__dispatch( slice.actions.activateDocument( mockDocument ) );

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
