import { markConnectSuccessNotificationForAfterReload } from './post-reload-connect-success-notification';

const RELOAD_QUERY_PARAM = 'elementor_pro_setup_connected';

export function reloadEditorAfterConnectSuccess(): void {
	markConnectSuccessNotificationForAfterReload();

	try {
		const url = new URL( window.location.href );
		url.searchParams.set( RELOAD_QUERY_PARAM, String( Date.now() ) );
		window.location.assign( url.toString() );
	} catch {
		window.location.reload();
	}
}
