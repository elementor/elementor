import { Alpine } from '@elementor/alpinejs';

const STORE_NAME = 'editor-atomic-tabs-selection';

function ensureStore() {
	if ( ! Alpine.store( STORE_NAME ) ) {
		Alpine.store( STORE_NAME, {} );
	}

	return Alpine.store( STORE_NAME );
}

export function getActiveTabId( tabsId, fallback ) {
	const store = ensureStore();

	return store[ tabsId ] ?? fallback;
}

export function setActiveTabId( tabsId, tabId ) {
	const store = ensureStore();

	store[ tabsId ] = tabId;
}
