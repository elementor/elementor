import { markConnectSuccessNotificationForAfterReload } from './post-reload-connect-success-notification';
import { appendSetupRefreshQueryParams, type ReloadEditorForSetupRefreshOptions } from './pro-setup-editor-refresh';

export function reloadEditorAfterConnectSuccess(): void {
	markConnectSuccessNotificationForAfterReload();
	reloadEditorWithCacheBust();
}

export function reloadEditorForSetupRefresh( options: ReloadEditorForSetupRefreshOptions = {} ): void {
	reloadEditorWithCacheBust( options );
}

function reloadEditorWithCacheBust( options: ReloadEditorForSetupRefreshOptions = {} ): void {
	try {
		const url = new URL( window.location.href );
		appendSetupRefreshQueryParams( url, options );
		window.location.assign( url.toString() );
	} catch {
		window.location.reload();
	}
}
