import { __createStore, __deleteStore, __dispatch, __registerSlice } from '@elementor/store';

import { encodePersistedState } from '../persistence';
import { slice } from '../store/slice';
import { getPersistedState, type PanelStateStorage, sync } from '../sync';
import { type FloatingPanelDefaults, type FloatingPanelState } from '../types';

const persisted: FloatingPanelState = {
	isOpen: true,
	mode: 'docked',
	position: { insetInlineStart: 24, insetBlockStart: 80 },
	size: { inlineSize: 320, blockSize: 480 },
	zIndex: 1,
};

const defaults: FloatingPanelDefaults = {
	width: 320,
	height: 480,
	minWidth: 240,
	minHeight: 320,
	initialMode: 'docked',
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
