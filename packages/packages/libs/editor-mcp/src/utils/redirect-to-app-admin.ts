import { setReferrerRedirect } from '@elementor-external/angie-sdk';

const ANGIE_APP_URL = '/wp-admin/admin.php?page=angie-app';

export const redirectToAppAdmin = ( prompt: string ) => {
	const success = setReferrerRedirect( window.location.href, prompt );

	if ( ! success ) {
		return;
	}

	window.location.href = ANGIE_APP_URL;
};
