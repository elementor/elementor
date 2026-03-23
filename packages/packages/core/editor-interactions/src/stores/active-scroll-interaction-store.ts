import { useSyncExternalStore } from 'react';

import { type SizeStringValue } from '../types';

export type ActiveScrollInteraction = {
	start: SizeStringValue;
	end: SizeStringValue;
	relativeTo: string;
};

let activeScrollInteraction: ActiveScrollInteraction | null = null;
const listeners = new Set< () => void >();

export function setActiveScrollInteraction( data: ActiveScrollInteraction | null ) {
	activeScrollInteraction = data;
	listeners.forEach( ( listener ) => listener() );
}

function getActiveScrollInteraction(): ActiveScrollInteraction | null {
	return activeScrollInteraction;
}

function subscribe( listener: () => void ) {
	listeners.add( listener );
	return () => {
		listeners.delete( listener );
	};
}

export function useActiveScrollInteraction() {
	return useSyncExternalStore( subscribe, getActiveScrollInteraction, getActiveScrollInteraction );
}
