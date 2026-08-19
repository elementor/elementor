import { isExperimentActive } from '@elementor/editor-v1-adapters';

import { DEFAULT_STYLES_EXPERIMENT } from './default-styles-experiment';

export type DesignSystemTab = 'defaults' | 'variables' | 'classes';

const STORAGE_KEY = 'elementor_editor_design_system_active_tab';

function isDefaultStylesTabAvailable(): boolean {
	return isExperimentActive( DEFAULT_STYLES_EXPERIMENT );
}

function normalizeTab( tab: DesignSystemTab ): DesignSystemTab {
	if ( tab === 'defaults' && ! isDefaultStylesTabAvailable() ) {
		return 'variables';
	}

	return tab;
}

function readStoredTab(): DesignSystemTab {
	if ( typeof window === 'undefined' ) {
		return normalizeTab( 'defaults' );
	}
	try {
		const raw = window.localStorage.getItem( STORAGE_KEY );
		if ( raw === 'defaults' || raw === 'classes' || raw === 'variables' ) {
			return normalizeTab( raw );
		}
	} catch {
		// Storage may be unavailable (private mode, quota, etc.).
	}
	return normalizeTab( 'defaults' );
}

let pendingTabForOpen: DesignSystemTab | null = null;

let activeTabInMemory: DesignSystemTab = readStoredTab();

export function normalizeDesignSystemTab( tab: DesignSystemTab ): DesignSystemTab {
	return normalizeTab( tab );
}

export function setPendingDesignSystemTab( tab: DesignSystemTab ): void {
	pendingTabForOpen = normalizeTab( tab );
}

export function getInitialDesignSystemTab(): DesignSystemTab {
	if ( pendingTabForOpen ) {
		const t = pendingTabForOpen;
		pendingTabForOpen = null;
		activeTabInMemory = t;
		persistDesignSystemTab( t );
		return t;
	}
	const t = readStoredTab();
	activeTabInMemory = t;
	return t;
}

export function notifyDesignSystemTabChange( tab: DesignSystemTab ): void {
	activeTabInMemory = tab;
}

export function getActiveDesignSystemTab(): DesignSystemTab {
	return activeTabInMemory;
}

export function persistDesignSystemTab( tab: DesignSystemTab ): void {
	if ( typeof window === 'undefined' ) {
		return;
	}
	try {
		window.localStorage.setItem( STORAGE_KEY, tab );
	} catch {
		// Ignore persistence failures.
	}
}
