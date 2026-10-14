import { createMockDocument, createMockElementData, renderHookWithStore } from 'test-utils';
import { __createStore, __dispatch, __registerSlice, type SliceState, type Store } from '@elementor/store';

import { slice } from '../store';
import { useLoadedTemplates } from '../use-loaded-templates';

describe( 'useLoadedTemplates', () => {
	let store: Store< SliceState< typeof slice > >;

	beforeEach( () => {
		__registerSlice( slice );
		store = __createStore();
	} );

	it( 'should call the callback when templates are loaded', () => {
		// Arrange.
		const doc = createMockDocument( { id: 1, elements: [ createMockElementData( { id: 'test-1' } ) ] } );

		// Act.
		const { result } = renderHookWithStore( () => useLoadedTemplates(), store );

		// Assert.
		expect( result.current ).toEqual( [] );

		// Act.
		__dispatch( slice.actions.setTemplates( [ doc ] ) );

		const { result: result2 } = renderHookWithStore( () => useLoadedTemplates(), store );

		// Assert.
		expect( result2.current ).toEqual( [ doc.elements ] );
	} );

	it( 'should call the callback again when templates change', () => {
		// Arrange.
		const doc1 = createMockDocument( { id: 1, elements: [ createMockElementData( { id: 'test-1' } ) ] } );
		const doc2 = createMockDocument( { id: 2, elements: [ createMockElementData( { id: 'test-2' } ) ] } );

		const { result } = renderHookWithStore( () => useLoadedTemplates(), store );

		// Assert.
		expect( result.current ).toEqual( [] );

		// Act.
		__dispatch( slice.actions.setTemplates( [ doc1 ] ) );
		__dispatch( slice.actions.setTemplates( [ doc2 ] ) );

		const { result: result2 } = renderHookWithStore( () => useLoadedTemplates(), store );

		// Assert.
		expect( result2.current ).toEqual( [ doc1.elements, doc2.elements ] );
	} );
} );
