import { ANGIE_SIDEBAR_STATE_OPEN, saveState, setReferrerRedirect } from '@elementor-external/angie-sdk';

const ANGIE_APP_URL = '/wp-admin/admin.php?page=angie-app';
const COMMUNITY_LIBRARY_URL_PARAM = 'open_community_library=true';

export const redirectToAppAdmin = ( { prompt, openCommunityLibrary }: { prompt?: string; openCommunityLibrary?: boolean } ) => {
	setReferrerRedirect( window.location.href, prompt );
	saveState( ANGIE_SIDEBAR_STATE_OPEN );
	window.location.href = `${ ANGIE_APP_URL }${ openCommunityLibrary ? `&${ COMMUNITY_LIBRARY_URL_PARAM }` : '' }`;
};
