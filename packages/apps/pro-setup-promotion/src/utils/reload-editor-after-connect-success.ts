import { markConnectSuccessNotificationForAfterReload } from './post-reload-connect-success-notification';

export const PRO_SETUP_CONNECT_RELOAD_QUERY_PARAM = 'elementor_pro_setup_connected';

export function reloadEditorAfterConnectSuccess(): void {
	markConnectSuccessNotificationForAfterReload();
	reloadEditorWithCacheBust();
}

export function reloadEditorForSetupRefresh(): void {
	reloadEditorWithCacheBust();
}

function reloadEditorWithCacheBust(): void {
	try {
		const url = new URL( window.location.href );
		url.searchParams.set( PRO_SETUP_CONNECT_RELOAD_QUERY_PARAM, String( Date.now() ) );
		window.location.assign( url.toString() );
	} catch {
		window.location.reload();
	}
}
