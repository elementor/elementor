import {
	ANGIE_SIDEBAR_STATE_OPEN,
	clearReferrerRedirect,
	getAngieIframe,
	isAngiePluginActive,
	saveState,
	setReferrerRedirect,
	toggleAngieSidebar,
	waitForAngiePluginActive,
} from '@elementor-external/angie-sdk';

const PROMPT_HASH_KEY = 'angie-prompt';
const PENDING_PROMPT_STORAGE_KEY = 'elementor_agent_ready_pending_angie_prompt';
const ANGIE_ACTIVATION_RETURN_PARAM = 'open-angie';
const ANGIE_READY_TIMEOUT_MS = 10000;

export const canOpenAngie = ( isAngieActive ) => Boolean( isAngieActive ) || isAngiePluginActive() || Boolean( getAngieIframe() );

export const openAngieWithPrompt = ( prompt ) => {
	const iframe = getAngieIframe();

	if ( iframe ) {
		toggleAngieSidebar( iframe, true );
	}

	window.location.hash = `${ PROMPT_HASH_KEY }=${ encodeURIComponent( prompt ) }`;
};

export const openAngieAfterInstall = ( prompt, angieAppUrl ) => {
	sessionStorage.setItem( PENDING_PROMPT_STORAGE_KEY, prompt );
	setReferrerRedirect( window.location.href, prompt );
	saveState( ANGIE_SIDEBAR_STATE_OPEN );
	window.location.assign( angieAppUrl );
};

const isReturningFromAngieActivation = () => {
	const hasPromptHash = window.location.hash.includes( `${ PROMPT_HASH_KEY }=` );

	return ! hasPromptHash && new URLSearchParams( window.location.search ).has( ANGIE_ACTIVATION_RETURN_PARAM );
};

// Angie's activation redirect bounces straight back here, so the SDK never reads the stored prompt on the angie-app page.
export const deliverPendingAngiePrompt = async () => {
	const prompt = sessionStorage.getItem( PENDING_PROMPT_STORAGE_KEY );

	if ( ! prompt || ! isReturningFromAngieActivation() ) {
		return;
	}

	try {
		if ( ! await waitForAngiePluginActive( ANGIE_READY_TIMEOUT_MS ) ) {
			return;
		}

		sessionStorage.removeItem( PENDING_PROMPT_STORAGE_KEY );
		clearReferrerRedirect();
		openAngieWithPrompt( prompt );
	} catch {
	}
};
