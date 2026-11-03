import {
  PRO_SETUP_CONNECT_RELOAD_ATTEMPT_STORAGE_KEY,
  PRO_SETUP_OPEN_CONNECT_QUERY_PARAM,
} from './pro-setup-query-params';

export function hasConnectReloadBeenAttempted(): boolean {
  try {
    return '1' === sessionStorage.getItem( PRO_SETUP_CONNECT_RELOAD_ATTEMPT_STORAGE_KEY );
  } catch {
    return false;
  }
}

export function markConnectReloadAttempted(): void {
  try {
    sessionStorage.setItem( PRO_SETUP_CONNECT_RELOAD_ATTEMPT_STORAGE_KEY, '1' );
  } catch {
    // ignore
  }
}

export function clearConnectReloadAttempted(): void {
  try {
    sessionStorage.removeItem( PRO_SETUP_CONNECT_RELOAD_ATTEMPT_STORAGE_KEY );
  } catch {
    // ignore
  }
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
