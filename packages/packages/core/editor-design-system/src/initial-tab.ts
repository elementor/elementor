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

export function getInitialDesignSystemTab(): DesignSystemTab {
	return readStoredTab();
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
