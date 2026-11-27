import { useSyncExternalStore } from 'react';

export type ElementsPanelSelection = 'atomic' | 'non_atomic';

const STORAGE_KEY = 'elementor:new-experience:elements-panel';
const DEFAULT_SELECTION: ElementsPanelSelection = 'atomic';
const SELECTIONS: ElementsPanelSelection[] = [ 'atomic', 'non_atomic' ];

const listeners = new Set< () => void >();

let currentSelection: ElementsPanelSelection | null = null;

function readStoredSelection(): ElementsPanelSelection {
	try {
		const stored = window.localStorage.getItem( STORAGE_KEY ) as ElementsPanelSelection | null;

		return stored && SELECTIONS.includes( stored ) ? stored : DEFAULT_SELECTION;
	} catch {
		return DEFAULT_SELECTION;
	}
}

export function getElementsPanelSelection(): ElementsPanelSelection {
	currentSelection ??= readStoredSelection();

	return currentSelection;
}

export function setElementsPanelSelection( selection: ElementsPanelSelection ) {
	currentSelection = selection;

	try {
		window.localStorage.setItem( STORAGE_KEY, selection );
	} catch {}

	listeners.forEach( ( listener ) => listener() );
}

export function useElementsPanelSelection() {
	return useSyncExternalStore( subscribeToElementsPanelSelection, getElementsPanelSelection );
}

export function subscribeToElementsPanelSelection( listener: () => void ) {
	listeners.add( listener );

	return () => {
		listeners.delete( listener );
	};
}
