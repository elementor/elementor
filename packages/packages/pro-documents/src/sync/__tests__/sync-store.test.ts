import { syncStore } from '../sync-store';
import { createSlice, Slice } from '../../store';
import { ExtendedWindow, ProV1Document } from '../../types';
import { Store, createStore, SliceState } from '@elementor/store';

describe( '@elementor/pro-documents - Sync Store', () => {
	let store: Store<SliceState<Slice>>;
	let slice: Slice;

	beforeEach( () => {
		slice = createSlice();
		store = createStore();

		syncStore( slice );
	} );

	it( 'should sync documents on V1 load', () => {
		// Arrange.
		mockV1DocumentsManager( [
			makeMockV1Document( { id: 1 } ),
			makeMockV1Document( { id: 2, locationKey: 'popup' } ),
		] );

		// Act.
		dispatchEvent( new CustomEvent( 'elementor/initialized' ) );

		// Assert.
		const storeState = store.getState();

		expect( storeState[ 'pro-documents' ].entities ).toEqual( {
			1: {
				id: 1,
				locationKey: null,
			},
			2: {
				id: 2,
				locationKey: 'popup',
			},
		} );
	} );

	it( 'should sync documents on V1 load', () => {
		// Arrange.
		mockV1DocumentsManager( [
			makeMockV1Document( { id: 1 } ),
			makeMockV1Document( { id: 2, locationKey: 'popup' } ),
		] );

		// Act.
		dispatchEvent( new CustomEvent( 'elementor/commands/run/after', { detail: {
			command: 'editor/documents/open',
		} } ) );

		// Assert.
		const storeState = store.getState();

		expect( storeState[ 'pro-documents' ].entities ).toEqual( {
			1: {
				id: 1,
				locationKey: null,
			},
		} );
	} );
} );

function mockV1DocumentsManager( documentsArray: ProV1Document[], current = 1 ) {
	( window as unknown as ExtendedWindow ).elementor = {
		documents: makeDocumentsManager( documentsArray, current ),
	};
}

function makeDocumentsManager( documentsArray: ProV1Document[], current = 1, initial = current ) {
	const documents = documentsArray.reduce( ( acc: Record<number, ProV1Document>, document ) => {
		acc[ document.id ] = document;

		return acc;
	}, {} );

	return {
		documents,
		getCurrentId() {
			return current;
		},
		getInitialId() {
			return initial;
		},
		getCurrent() {
			return this.documents[ this.getCurrentId() ];
		},
	};
}

function makeMockV1Document( {
	id = 1,
	locationKey = '',
}: {
	id?: number,
	locationKey?: string,
} = {} ): ProV1Document {
	return {
		id,
		config: {
			theme_builder: {
				settings: {
					location: locationKey,
				},
			},
		},
	};
}
