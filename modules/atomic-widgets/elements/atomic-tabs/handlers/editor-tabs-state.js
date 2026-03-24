import { Alpine } from '@elementor/alpinejs';
import { getTabId } from './utils';

/**
 * @typedef {Record<string, number>} TabsState - Maps tabsId to the selected tab index.
 */
const STORE_NAME = 'editor-atomic-tabs-state';

function ensureStore() {
	if ( ! Alpine.store( STORE_NAME ) ) {
		Alpine.store( STORE_NAME, /** @type {TabsState} */ ( {} ) );
	}

	return /** @type {TabsState} */ ( Alpine.store( STORE_NAME ) );
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
