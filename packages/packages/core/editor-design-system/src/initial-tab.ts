export type DesignSystemTab = 'defaults' | 'variables' | 'classes';

export type DesignSystemView = DesignSystemTab | null;

const STORAGE_KEY = 'elementor_editor_design_system_active_tab';

function readStoredTab(): DesignSystemTab {
	if ( typeof window === 'undefined' ) {
		return 'defaults';
	}
	try {
		const raw = window.localStorage.getItem( STORAGE_KEY );
		if ( raw === 'defaults' || raw === 'classes' || raw === 'variables' ) {
			return raw;
		}
	} catch {
		// Storage may be unavailable (private mode, quota, etc.).
	}
	return 'defaults';
}

let pendingOpenView: DesignSystemView | undefined;

let activeViewInMemory: DesignSystemView = null;

export function normalizeDesignSystemTab( tab: DesignSystemTab ): DesignSystemTab {
	return tab;
}

export function setPendingDesignSystemTab( tab: DesignSystemTab ): void {
	pendingOpenView = tab;
}

export function setPendingDesignSystemHome(): void {
	pendingOpenView = null;
}

function consumePendingOpen(): DesignSystemView | undefined {
	if ( pendingOpenView === undefined ) {
		return undefined;
	}
	const view = pendingOpenView;
	pendingOpenView = undefined;
	activeViewInMemory = view;
	if ( view ) {
		persistDesignSystemTab( view );
	}
	return view;
}

export function getInitialDesignSystemView(): DesignSystemView {
	const pending = consumePendingOpen();
	if ( pending !== undefined ) {
		return pending;
	}
	activeViewInMemory = null;
	return null;
}

export function getInitialDesignSystemTab(): DesignSystemTab {
	const pending = consumePendingOpen();
	if ( pending !== undefined ) {
		return pending ?? readStoredTab();
	}
	const stored = readStoredTab();
	activeViewInMemory = stored;
	return stored;
}

export function notifyDesignSystemViewChange( view: DesignSystemView ): void {
	activeViewInMemory = view;
}

export function notifyDesignSystemTabChange( tab: DesignSystemTab ): void {
	activeViewInMemory = tab;
}

export function getActiveDesignSystemView(): DesignSystemView {
	return activeViewInMemory;
}

export function getActiveDesignSystemTab(): DesignSystemTab {
	return activeViewInMemory ?? readStoredTab();
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