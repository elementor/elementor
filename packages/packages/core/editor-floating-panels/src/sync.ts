import { __getState, __subscribe } from '@elementor/store';

import { decodePersistedState, encodePersistedState, PERSISTENCE_STORAGE_KEY } from './persistence';
import { type FloatingPanelsSliceState } from './store/slice';
import { type FloatingPanelState } from './types';

const PERSIST_DEBOUNCE_MS = 250;

export interface PanelStateStorage {
	read(): string | null;
	write( value: string ): void;
}

export const localStorageAdapter: PanelStateStorage = {
	read: () => {
		try {
			return globalThis.localStorage?.getItem( PERSISTENCE_STORAGE_KEY ) ?? null;
		} catch {
			return null;
		}
	},
	write: ( value ) => {
		try {
			globalThis.localStorage?.setItem( PERSISTENCE_STORAGE_KEY, value );
		} catch {
			// Best-effort: storage may be full, blocked, or unavailable.
		}
	},
};

let cachedPersistedState: Record< string, FloatingPanelState > = {};

export function sync( storage: PanelStateStorage = localStorageAdapter ): void {
	cachedPersistedState = decodePersistedState( storage.read() );

	schedulePersistence( storage );
}

export function getPersistedState( id: string ): FloatingPanelState | undefined {
	return cachedPersistedState[ id ];
}

function schedulePersistence( storage: PanelStateStorage ): void {
	let timer: ReturnType< typeof setTimeout > | null = null;

	__subscribe( () => {
		if ( timer ) {
			clearTimeout( timer );
		}

		timer = setTimeout( () => {
			const state = __getState() as { floatingPanels?: FloatingPanelsSliceState };

			storage.write( encodePersistedState( state.floatingPanels?.byId ?? {} ) );
		}, PERSIST_DEBOUNCE_MS );
	} );
}
