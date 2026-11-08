import {
	PRO_SETUP_CONNECT_RELOAD_ATTEMPT_STORAGE_KEY,
	PRO_SETUP_OPEN_CONNECT_QUERY_PARAM,
} from './pro-setup-query-params';

const CONNECT_RELOAD_ATTEMPT_TTL_MS = 5 * 60 * 1000;

export function isOpenConnectQueryParamInUrl(): boolean {
	try {
		const url = new URL( window.location.href );

		return '1' === url.searchParams.get( PRO_SETUP_OPEN_CONNECT_QUERY_PARAM );
	} catch {
		return false;
	}
}

function readStoredValue( key: string ): string | null {
	let sessionValue: string | null = null;

	try {
		sessionValue = sessionStorage.getItem( key );
	} catch {
		sessionValue = null;
	}

	if ( null !== sessionValue ) {
		return sessionValue;
	}

	try {
		return localStorage.getItem( key );
	} catch {
		return null;
	}
}

function writeStoredValue( key: string, value: string ): void {
	try {
		sessionStorage.setItem( key, value );
		return;
	} catch {
		// ignore
	}

	try {
		localStorage.setItem( key, value );
	} catch {
		// ignore
	}
}

function removeStoredValue( key: string ): void {
	try {
		sessionStorage.removeItem( key );
	} catch {
		// ignore
	}

	try {
		localStorage.removeItem( key );
	} catch {
		// ignore
	}
}

function readConnectReloadAttemptedAt(): number | null {
	const raw = readStoredValue( PRO_SETUP_CONNECT_RELOAD_ATTEMPT_STORAGE_KEY );

	if ( ! raw ) {
		return null;
	}

	const timestamp = Number( raw );

	return Number.isFinite( timestamp ) ? timestamp : null;
}

export function hasConnectReloadBeenAttempted(): boolean {
	const timestamp = readConnectReloadAttemptedAt();

	if ( null === timestamp ) {
		return false;
	}

	if ( Date.now() - timestamp > CONNECT_RELOAD_ATTEMPT_TTL_MS ) {
		clearConnectReloadAttempted();
		return false;
	}

	return true;
}

export function markConnectReloadAttempted(): void {
	writeStoredValue( PRO_SETUP_CONNECT_RELOAD_ATTEMPT_STORAGE_KEY, String( Date.now() ) );
}

export function clearConnectReloadAttempted(): void {
	removeStoredValue( PRO_SETUP_CONNECT_RELOAD_ATTEMPT_STORAGE_KEY );
}

export function stripOpenConnectQueryParamFromUrl(): void {
	try {
		const url = new URL( window.location.href );

		if ( '1' !== url.searchParams.get( PRO_SETUP_OPEN_CONNECT_QUERY_PARAM ) ) {
			return;
		}

		url.searchParams.delete( PRO_SETUP_OPEN_CONNECT_QUERY_PARAM );
		window.history.replaceState( null, '', url.toString() );
	} catch {
		// ignore
	}
}
