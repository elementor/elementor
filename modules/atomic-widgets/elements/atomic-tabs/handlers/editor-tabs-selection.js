import { Alpine } from '@elementor/alpinejs';
import { getTabId } from './utils';

const STORE_NAME = 'editor-atomic-tabs-selection';

function ensureStore() {
	if ( ! Alpine.store( STORE_NAME ) ) {
		Alpine.store( STORE_NAME, {} );
	}

	return Alpine.store( STORE_NAME );
}

export function getActiveTabId( tabsId, fallback ) {
	const store = ensureStore();
	const storedIndex = store[ tabsId ];

	if ( storedIndex === undefined ) {
		return fallback;
	}

	return getTabId( tabsId, storedIndex );
}

export function setActiveTabIndex( tabsId, index ) {
	const store = ensureStore();

	store[ tabsId ] = index;
}

export function validateActiveTab( tabsId, tabCount ) {
	const store = ensureStore();
	const storedIndex = store[ tabsId ];

	if ( storedIndex === undefined ) {
		return;
	}

	if ( storedIndex >= tabCount ) {
		delete store[ tabsId ];
	}
}
