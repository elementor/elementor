import { useSyncExternalStore } from 'react';

export type ElementsPanelSelection = 'atomic' | 'non_atomic';

const STORAGE_KEY = 'elementor:new-experience:elements-panel';
const DEFAULT_SELECTION: ElementsPanelSelection = 'atomic';
const SELECTIONS: ElementsPanelSelection[] = [ 'atomic', 'non_atomic' ];

const listeners = new Set< () => void >();

export function getElementsPanelSelection(): ElementsPanelSelection {
	try {
		const stored = window.localStorage.getItem( STORAGE_KEY ) as ElementsPanelSelection | null;

		return stored && SELECTIONS.includes( stored ) ? stored : DEFAULT_SELECTION;
	} catch {
		return DEFAULT_SELECTION;
	}
}

export function setElementsPanelSelection( selection: ElementsPanelSelection ) {
	try {
		window.localStorage.setItem( STORAGE_KEY, selection );
	} catch {}

	listeners.forEach( ( listener ) => listener() );
}

export function useElementsPanelSelection() {
	return useSyncExternalStore( ( listener ) => {
		listeners.add( listener );

		return () => {
			listeners.delete( listener );
		};
	}, getElementsPanelSelection );
}
