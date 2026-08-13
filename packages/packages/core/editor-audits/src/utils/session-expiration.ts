import { getWindowConfig } from './window-config';

const NONCE_INVALID_CODE = 'rest_cookie_invalid_nonce';
const DEFAULT_AJAX_URL = '/wp-admin/admin-ajax.php';

type AjaxErrorLikeResponse = {
	status?: number;
	data?: { code?: string };
};

type AjaxErrorLike = {
	response?: AjaxErrorLikeResponse;
};

type SessionWindow = Window & {
	jQuery?: ( target: Document ) => { trigger: ( event: string, data?: unknown[] ) => void };
	elementorCommon?: { ajax?: { config?: { url?: string } } };
};

export class SessionExpiredError extends Error {}

let nonceRefreshPromise: Promise< string > | null = null;

export function isNonceInvalidError( error: unknown ): boolean {
	const response = ( error as AjaxErrorLike | undefined )?.response;

	return response?.status === 403 && response?.data?.code === NONCE_INVALID_CODE;
}

export async function refreshAuditsNonce(): Promise< string > {
	if ( nonceRefreshPromise ) {
		return nonceRefreshPromise;
	}

	nonceRefreshPromise = requestFreshNonce();

	try {
		return await nonceRefreshPromise;
	} finally {
		nonceRefreshPromise = null;
	}
}

async function requestFreshNonce(): Promise< string > {
	const ajaxUrl = ( window as SessionWindow ).elementorCommon?.ajax?.config?.url ?? DEFAULT_AJAX_URL;
	const url = new URL( ajaxUrl, window.location.origin );
	url.searchParams.set( 'action', 'rest-nonce' );

	const response = await fetch( url.toString(), { credentials: 'same-origin' } );

	if ( ! response.ok ) {
		throw new Error( `Failed to refresh audits nonce: HTTP ${ response.status }` );
	}

	const nonce = await response.text();

	if ( ! nonce || '0' === nonce ) {
		throw new SessionExpiredError( 'Session expired — received invalid nonce' );
	}

	window.elementorAudits = { ...getWindowConfig(), nonce };

	return nonce;
}

export function showSessionExpiredModal(): void {
	( window as SessionWindow )
		.jQuery?.( document )
		.trigger( 'heartbeat-tick.wp-auth-check', [ { 'wp-auth-check': false } ] );
}
