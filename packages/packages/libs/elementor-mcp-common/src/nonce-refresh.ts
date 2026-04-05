import type { WpApiSettings } from './types';
import { getAjaxUrl, getJQuery, getWpApiSettings } from './utils';

type HeartbeatTickData = {
	angie_nonce?: string;
};

let isNonceRefreshInitialized = false;
let nonceRefreshPromise: Promise< string > | null = null;

export function initNonceRefresh(): void {
	const jQuery = getJQuery();
	const wpApiSettings = getWpApiSettings();
	if ( isNonceRefreshInitialized || typeof jQuery === 'undefined' || ! wpApiSettings ) {
		return;
	}

	isNonceRefreshInitialized = true;

	jQuery?.( document ).on( 'heartbeat-tick.angieNonceRefresh', ( _event: unknown, data: unknown ) => {
		try {
			const tickData = data as HeartbeatTickData;
			const currentSettings = getWpApiSettings() as WpApiSettings | undefined;
			if ( tickData.angie_nonce && currentSettings && currentSettings.nonce !== tickData.angie_nonce ) {
				currentSettings.nonce = tickData.angie_nonce;
			}
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.error( 'Failed to refresh nonce:', error );
		}
	} );
}

export async function refreshNonce(): Promise< string > {
	if ( nonceRefreshPromise ) {
		return nonceRefreshPromise;
	}

	nonceRefreshPromise = fetchFreshNonce();

	try {
		return await nonceRefreshPromise;
	} finally {
		nonceRefreshPromise = null;
	}
}

async function fetchFreshNonce(): Promise< string > {
	const ajaxUrl = new URL( getAjaxUrl() || '/wp-admin/admin-ajax.php', window.location.origin );
	ajaxUrl.searchParams.set( 'action', 'rest-nonce' );
	const response = await fetch( ajaxUrl.toString(), {
		credentials: 'same-origin',
	} );

	if ( ! response.ok ) {
		throw new Error( `Failed to refresh nonce: HTTP ${ response.status }` );
	}

	const nonce = await response.text();

	if ( ! nonce || nonce === '0' ) {
		throw new Error( 'Session expired — received invalid nonce' );
	}

	const wpApiSettings = getWpApiSettings() as WpApiSettings | undefined;
	if ( ! wpApiSettings ) {
		throw new Error( 'wpApiSettings not available — cannot refresh nonce' );
	}

	wpApiSettings.nonce = nonce;
	return nonce;
}

export function isNonceError( status: number, responseText: string ): boolean {
	return status === 403 && responseText.includes( 'rest_cookie_invalid_nonce' );
}
