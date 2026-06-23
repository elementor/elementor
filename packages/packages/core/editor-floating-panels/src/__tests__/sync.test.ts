import { __createStore, __deleteStore, __dispatch, __registerSlice } from '@elementor/store';

import { encodePersistedState } from '../persistence';
import { slice } from '../store/slice';
import { getPersistedState, localStorageAdapter, type PanelStateStorage, sync } from '../sync';
import { type FloatingPanelDefaults, type FloatingPanelState } from '../types';

const persisted: FloatingPanelState = {
	isOpen: true,
	position: { insetInlineStart: 24, insetBlockStart: 80 },
	size: { inlineSize: 320, blockSize: 480 },
	zIndex: 1,
};

const defaults: FloatingPanelDefaults = {
	width: 320,
	height: 480,
	minWidth: 240,
	minHeight: 320,
};

function createMemoryStorage( initial: string | null = null ): PanelStateStorage & { snapshot: () => string | null } {
	let value: string | null = initial;

	return {
		read: () => value,
		write: ( v ) => {
			value = v;
		},
		snapshot: () => value,
	};
}

describe( 'sync', () => {
	beforeEach( () => {
		__registerSlice( slice );
		__createStore();
		jest.useFakeTimers();
	} );

	afterEach( () => {
		jest.useRealTimers();
		__deleteStore();
	} );

	it( 'reads persisted state on sync() and exposes it via getPersistedState', () => {
		// Arrange.
		const storage = createMemoryStorage( encodePersistedState( { 'audit-panel': persisted } ) );

		// Act.
		sync( storage );

		// Assert.
		expect( getPersistedState( 'audit-panel' ) ).toEqual( persisted );
	} );

	it( 'returns undefined for unknown panel IDs', () => {
		// Arrange.
		const storage = createMemoryStorage();

		// Act.
		sync( storage );

		// Assert.
		expect( getPersistedState( 'never-persisted' ) ).toBeUndefined();
	} );

	it( 'writes the store state to storage after a debounced delay', () => {
		// Arrange.
		const storage = createMemoryStorage();
		sync( storage );

		// Act.
		__dispatch( slice.actions.register( { id: 'a', defaults } ) );
		__dispatch( slice.actions.open( 'a' ) );

		// Assert — nothing written yet (still inside debounce window).
		expect( storage.snapshot() ).toBe( null );

		// Act — fast-forward past the debounce.
		jest.advanceTimersByTime( 300 );

		// Assert.
		const written = storage.snapshot();
		expect( written ).not.toBe( null );
		const parsed = JSON.parse( written as string );
		expect( parsed.a.isOpen ).toBe( true );
	} );
} );

describe( 'sync before the store is ready', () => {
	beforeEach( () => {
		__registerSlice( slice );
		jest.useFakeTimers();
	} );

	afterEach( () => {
		jest.useRealTimers();
		__deleteStore();
	} );

	it( 'subscribes to persistence after the store becomes ready', () => {
		// Arrange.
		const storage = createMemoryStorage();
		sync( storage );

		// Act.
		__createStore();
		jest.advanceTimersByTime( 20 );
		__dispatch( slice.actions.register( { id: 'a', defaults } ) );
		jest.advanceTimersByTime( 300 );

		// Assert.
		expect( storage.snapshot() ).not.toBe( null );
	} );
} );

describe( 'localStorageAdapter', () => {
	it( 'returns null when localStorage read throws', () => {
		// Arrange.
		const getItem = jest.spyOn( Storage.prototype, 'getItem' ).mockImplementation( () => {
			throw new Error( 'blocked' );
		} );

		// Act.
		const value = localStorageAdapter.read();

		// Assert.
		expect( value ).toBeNull();

		getItem.mockRestore();
	} );

	it( 'swallows localStorage write errors', () => {
		// Arrange.
		const setItem = jest.spyOn( Storage.prototype, 'setItem' ).mockImplementation( () => {
			throw new Error( 'quota exceeded' );
		} );

		// Act / Assert.
		expect( () => localStorageAdapter.write( '{}' ) ).not.toThrow();

		setItem.mockRestore();
	} );
} );
