import {
	clearConnectReloadAttempted,
	hasConnectReloadBeenAttempted,
	isOpenConnectQueryParamInUrl,
	markConnectReloadAttempted,
	stripOpenConnectQueryParamFromUrl,
} from '../pro-setup-connect-reload-guard';
import {
	PRO_SETUP_CONNECT_RELOAD_ATTEMPT_STORAGE_KEY,
	PRO_SETUP_OPEN_CONNECT_QUERY_PARAM,
} from '../pro-setup-query-params';

describe( 'pro-setup-connect-reload-guard', () => {
	const originalHref = window.location.href;

	afterEach( () => {
		clearConnectReloadAttempted();
		window.history.replaceState( null, '', originalHref );
	} );

	it( 'detects open connect query param in the URL', () => {
		const url = new URL( originalHref );
		url.searchParams.set( PRO_SETUP_OPEN_CONNECT_QUERY_PARAM, '1' );
		window.history.replaceState( null, '', url.toString() );

		expect( isOpenConnectQueryParamInUrl() ).toBe( true );
	} );

	it( 'strips open connect query param from the URL', () => {
		const url = new URL( originalHref );
		url.searchParams.set( PRO_SETUP_OPEN_CONNECT_QUERY_PARAM, '1' );
		window.history.replaceState( null, '', url.toString() );

		stripOpenConnectQueryParamFromUrl();

		expect( isOpenConnectQueryParamInUrl() ).toBe( false );
	} );

	it( 'marks and reads a connect reload attempt from storage', () => {
		expect( hasConnectReloadBeenAttempted() ).toBe( false );

		markConnectReloadAttempted();

		expect( hasConnectReloadBeenAttempted() ).toBe( true );
		expect( sessionStorage.getItem( PRO_SETUP_CONNECT_RELOAD_ATTEMPT_STORAGE_KEY ) ).toBeTruthy();
	} );

	it( 'clears an expired connect reload attempt', () => {
		const expiredTimestamp = String( Date.now() - 6 * 60 * 1000 );
		sessionStorage.setItem( PRO_SETUP_CONNECT_RELOAD_ATTEMPT_STORAGE_KEY, expiredTimestamp );

		expect( hasConnectReloadBeenAttempted() ).toBe( false );
		expect( sessionStorage.getItem( PRO_SETUP_CONNECT_RELOAD_ATTEMPT_STORAGE_KEY ) ).toBeNull();
	} );
} );
