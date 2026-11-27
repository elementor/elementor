import { useSyncExternalStore } from 'react';

let owner: string | null = null;

const listeners = new Set< () => void >();

function subscribe( listener: () => void ) {
	listeners.add( listener );

	return () => {
		listeners.delete( listener );
	};
}

function notify() {
	listeners.forEach( ( listener ) => listener() );
}

export function acquireSidebarRailLock( key: string ): () => void {
	owner = key;
	notify();

	return () => {
		if ( owner !== key ) {
			return;
		}

		owner = null;
		notify();
	};
}

export function useIsSidebarRailLocked( selfKey?: string ): boolean {
	return useSyncExternalStore(
		subscribe,
		() => owner !== null && owner !== selfKey,
		() => false
	);
}
