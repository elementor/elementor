export type DesignSystemTab = 'variables' | 'classes';

const STORAGE_KEY = 'elementor_editor_design_system_active_tab';

function readStoredTab(): DesignSystemTab {
	if ( typeof window === 'undefined' ) {
		return 'variables';
	}
	try {
		const raw = window.localStorage.getItem( STORAGE_KEY );
		if ( raw === 'classes' || raw === 'variables' ) {
			return raw;
		}
	} catch {
		// Storage may be unavailable (private mode, quota, etc.).
	}
	return 'variables';
}

/** Consumed once when the design system panel mounts (URL open, entry buttons, events). */
let pendingTabForOpen: DesignSystemTab | null = null;

/** Last active tab — used for toggle (same tab ⇒ close). Synced from panel UI. */
let activeTabInMemory: DesignSystemTab = readStoredTab();

/**
 * Sets which tab opens on the next design system panel open. Cleared when
 * {@link getInitialDesignSystemTab} runs (panel mounts).
 */
export function setPendingDesignSystemTab( tab: DesignSystemTab ): void {
	pendingTabForOpen = tab;
}

export function getInitialDesignSystemTab(): DesignSystemTab {
	if ( pendingTabForOpen ) {
		const t = pendingTabForOpen;
		pendingTabForOpen = null;
		activeTabInMemory = t;
		return t;
	}
	const t = readStoredTab();
	activeTabInMemory = t;
	return t;
}

/** Call when the user changes tab or when the panel reflects a tab (keeps toggle accurate). */
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
