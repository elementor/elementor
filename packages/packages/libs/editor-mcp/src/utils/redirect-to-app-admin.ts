import { ANGIE_SIDEBAR_STATE_OPEN, saveState, setReferrerRedirect } from '@elementor-external/angie-sdk';

const ANGIE_APP_URL = '/wp-admin/admin.php?page=angie-app';

export const redirectToAppAdmin = ( prompt?: string ) => {
	setReferrerRedirect( window.location.href, prompt );
	saveState( ANGIE_SIDEBAR_STATE_OPEN );
	window.location.href = ANGIE_APP_URL;
};
