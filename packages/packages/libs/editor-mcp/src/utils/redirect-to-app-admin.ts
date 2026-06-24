import { ANGIE_SIDEBAR_STATE_OPEN, saveState, setReferrerRedirect } from '@elementor-external/angie-sdk';

const ANGIE_APP_URL = '/wp-admin/admin.php?page=angie-app';

export const redirectToAppAdmin = ( { prompt, urlParams }: { prompt?: string; urlParams?: string } ) => {
	setReferrerRedirect( window.location.href, prompt );
	saveState( ANGIE_SIDEBAR_STATE_OPEN );
	const newHref = `${ ANGIE_APP_URL }${ urlParams ? `&${ urlParams }` : '' }`;
	console.log( 'newHref', newHref );
	window.location.href = newHref;
};
