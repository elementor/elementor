import {
	ANGIE_SIDEBAR_STATE_OPEN,
	getAngieIframe,
	isAngiePluginActive,
	saveState,
	setReferrerRedirect,
	toggleAngieSidebar,
} from '@elementor-external/angie-sdk';

const PROMPT_HASH_KEY = 'angie-prompt';

export const canOpenAngie = ( isAngieActive ) => Boolean( isAngieActive ) || isAngiePluginActive() || Boolean( getAngieIframe() );

export const openAngieWithPrompt = ( prompt ) => {
	const iframe = getAngieIframe();

	if ( iframe ) {
		toggleAngieSidebar( iframe, true );
	}

	window.location.hash = `${ PROMPT_HASH_KEY }=${ encodeURIComponent( prompt ) }`;
};

export const openAngieAfterInstall = ( prompt, angieAppUrl ) => {
	setReferrerRedirect( window.location.href, prompt );
	saveState( ANGIE_SIDEBAR_STATE_OPEN );
	window.location.assign( angieAppUrl );
};
