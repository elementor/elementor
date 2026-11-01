import { notify } from '@elementor/editor-notifications';
import { __ } from '@wordpress/i18n';

const SESSION_STORAGE_KEY = 'elementor_pro_setup_promotion_connect_success_pending';

export function markConnectSuccessNotificationForAfterReload(): void {
	try {
		sessionStorage.setItem( SESSION_STORAGE_KEY, '1' );
	} catch {
		// sessionStorage may be unavailable; reload still proceeds without deferred toast.
	}
}

export function showConnectSuccessNotificationAfterReloadIfPending(): void {
	try {
		if ( '1' !== sessionStorage.getItem( SESSION_STORAGE_KEY ) ) {
			return;
		}

		sessionStorage.removeItem( SESSION_STORAGE_KEY );

		notify( {
			type: 'success',
			message: __( 'Elementor Pro is connected and ready to use', 'elementor' ),
			id: 'pro-setup-promotion-connect-success',
		} );
	} catch {
		// ignore
	}
}
