import { __getStore, __subscribeWithSelector } from '@elementor/store';

import { decodePersistedState, encodePersistedState, PERSISTENCE_STORAGE_KEY } from './persistence';
import { type GlobalState } from './store/selectors';
import { type FloatingPanelState } from './types';

const PERSIST_DEBOUNCE_MS = 250;

export interface PanelStateStorage {
	read: () => string | null;
	write: ( value: string ) => void;
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
let isSyncInitialized = false;
let persistenceUnsubscribe: ( () => void ) | null = null;
let persistenceSession = 0;

export function isFloatingPanelsSyncInitialized(): boolean {
	return isSyncInitialized;
}

export function sync( storage: PanelStateStorage = localStorageAdapter ): void {
	isSyncInitialized = true;
	cachedPersistedState = decodePersistedState( storage.read() );

	schedulePersistence( storage );
}

export function getPersistedState( id: string ): FloatingPanelState | undefined {
	return cachedPersistedState[ id ];
}

const STORE_READY_POLL_MS = 16;

function schedulePersistence( storage: PanelStateStorage ): void {
	persistenceUnsubscribe?.();
	persistenceUnsubscribe = null;

	const session = ++persistenceSession;
	let timer: ReturnType< typeof setTimeout > | null = null;

	const subscribe = () => {
		if ( session !== persistenceSession ) {
			return;
		}

		persistenceUnsubscribe = __subscribeWithSelector(
			( state: GlobalState ) => state.floatingPanels.byId,
			( byId ) => {
				if ( timer ) {
					clearTimeout( timer );
				}

				timer = setTimeout( () => {
					storage.write( encodePersistedState( byId ) );
				}, PERSIST_DEBOUNCE_MS );
			}
		);
	};

	const waitForStore = () => {
		if ( session !== persistenceSession ) {
			return;
		}

		if ( __getStore() ) {
			subscribe();
			return;
		}

		setTimeout( waitForStore, STORE_READY_POLL_MS );
	};

	waitForStore();
}
