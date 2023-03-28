import { createMockDocument } from 'test-utils';
import { Slice, createSlice } from '../../store';
import useHostDocument from '../use-host-document';
import { renderHookWithStore } from './test-utils';
import { selectHostDocument } from '@elementor/documents';
import { createStore, dispatch, SliceState, Store } from '@elementor/store';

jest.mock( '@elementor/documents', () => ( {
	...jest.requireActual( '@elementor/documents' ),
	selectHostDocument: jest.fn().mockReturnValue( {} ),
} ) );

describe( '@elementor/pro-documents - useHostDocument', () => {
	let store: Store<SliceState<Slice>>;
	let slice: Slice;

	beforeEach( () => {
		slice = createSlice();
		store = createStore();
	} );

	it( 'should return the host core document with pro data', () => {
		// Arrange.
		const mockDocument = createMockDocument( { id: 1 } );

		jest.mocked( selectHostDocument ).mockReturnValue( mockDocument );

		dispatch( slice.actions.addDocument( {
			id: 1,
			locationKey: 'popup',
		} ) );

		// Act.
		const { result } = renderHookWithStore( useHostDocument, store );

		// Assert.
		expect( result.current ).toEqual( {
			...mockDocument,
			locationKey: 'popup',
		} );
	} );

	it( 'should return null when there is no host core document', () => {
		// Arrange.
		jest.mocked( selectHostDocument ).mockReturnValue( null );

		// Act.
		const { result } = renderHookWithStore( useHostDocument, store );

		// Assert.
		expect( result.current ).toBeNull();
	} );

	it( 'should return the host core document with default pro data', () => {
		// Arrange.
		const mockDocument = createMockDocument( { id: 1 } );

		jest.mocked( selectHostDocument ).mockReturnValue( mockDocument );

		const defaults = {
			locationKey: null,
		};

		// Act.
		const { result } = renderHookWithStore( useHostDocument, store );

		// Assert.
		expect( result.current ).toEqual( {
			...mockDocument,
			...defaults,
		} );
	} );
} );
