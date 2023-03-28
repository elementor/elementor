import { Slice, createSlice } from '../../store';
import useActiveDocument from '../use-active-document';
import { createStore, dispatch, SliceState, Store } from '@elementor/store';
import { renderHookWithStore } from './test-utils';
import { createMockDocument } from 'test-utils';
import { selectActiveDocument } from '@elementor/documents';

jest.mock( '@elementor/documents', () => ( {
	...jest.requireActual( '@elementor/documents' ),
	selectActiveDocument: jest.fn().mockReturnValue( {} ),
} ) );

describe( '@elementor/pro-documents - useActiveDocument', () => {
	let store: Store<SliceState<Slice>>;
	let slice: Slice;

	beforeEach( () => {
		slice = createSlice();
		store = createStore();
	} );

	it( 'should return the active core document with pro data', () => {
		// Arrange.
		const mockDocument = createMockDocument( { id: 1 } );

		jest.mocked( selectActiveDocument ).mockReturnValue( mockDocument );

		dispatch( slice.actions.addDocument( {
			id: 1,
			locationKey: 'popup',
		} ) );

		// Act.
		const { result } = renderHookWithStore( useActiveDocument, store );

		// Assert.
		expect( result.current ).toEqual( {
			...mockDocument,
			locationKey: 'popup',
		} );
	} );

	it( 'should return null when there is no active core document', () => {
		// Arrange.
		jest.mocked( selectActiveDocument ).mockReturnValue( null );

		// Act.
		const { result } = renderHookWithStore( useActiveDocument, store );

		// Assert.
		expect( result.current ).toBeNull();
	} );

	it( 'should return the active core document with default pro data', () => {
		// Arrange.
		const mockDocument = createMockDocument( { id: 1 } );

		jest.mocked( selectActiveDocument ).mockReturnValue( mockDocument );

		const defaults = {
			locationKey: null,
		};

		// Act.
		const { result } = renderHookWithStore( useActiveDocument, store );

		// Assert.
		expect( result.current ).toEqual( {
			...mockDocument,
			...defaults,
		} );
	} );
} );
