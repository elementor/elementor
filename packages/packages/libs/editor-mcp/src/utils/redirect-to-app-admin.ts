import { setReferrerRedirect } from '@elementor-external/angie-sdk';

const ANGIE_APP_URL = '/wp-admin/admin.php?page=angie-app';

export const redirectToAppAdmin = ( prompt?: string ) => {
	setReferrerRedirect( window.location.href, prompt );
	window.location.href = ANGIE_APP_URL;
};
