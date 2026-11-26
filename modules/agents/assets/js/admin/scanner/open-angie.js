import {
	ANGIE_SIDEBAR_STATE_OPEN,
	AngieMcpSdk,
	clearReferrerRedirect,
	getAngieIframe,
	isAngiePluginActive,
	isAngiePluginAvailable,
	LAYOUT_SIDEBAR,
	saveState,
	setReferrerRedirect,
	toggleAngieSidebar,
	waitForAngiePluginActive,
} from '@elementor-external/angie-sdk';

import { enableEndSideResize, injectEndSideStyles } from './end-side-sidebar';

const PROMPT_HASH_KEY = 'angie-prompt';
const PENDING_PROMPT_STORAGE_KEY = 'elementor_agent_ready_pending_angie_prompt';
const ANGIE_ACTIVATION_RETURN_PARAM = 'open-angie';
const ANGIE_READY_TIMEOUT_MS = 10000;
const ADMIN_PAGES_ANGIE_APP_ID = 'elementor-admin-pages';
const SIDEBAR_STATE_STORAGE_KEY = 'elementor_admin_pages_angie_sidebar_state';
const SIDEBAR_STATE_OPEN = 'open';
const SIDEBAR_STATE_CLOSED = 'closed';

let sdkBootPromise = null;
let isSdkBooted = false;

const saveSidebarState = ( isOpen ) => {
	try {
		localStorage.setItem( SIDEBAR_STATE_STORAGE_KEY, isOpen ? SIDEBAR_STATE_OPEN : SIDEBAR_STATE_CLOSED );
	} catch {
	}
};

const wasSidebarLeftOpen = () => {
	try {
		return SIDEBAR_STATE_OPEN === localStorage.getItem( SIDEBAR_STATE_STORAGE_KEY );
	} catch {
		return false;
	}
};

export const canOpenAngie = ( isAngieActive ) => Boolean( isAngieActive ) || isAngiePluginActive() || Boolean( getAngieIframe() );

const sendPromptToPlugin = ( prompt ) => {
	const iframe = getAngieIframe();

	if ( iframe ) {
		toggleAngieSidebar( iframe, true );
	}

	window.location.hash = `${ PROMPT_HASH_KEY }=${ encodeURIComponent( prompt ) }`;
};

const bootSdk = () => {
	sdkBootPromise ??= ( async () => {
		injectEndSideStyles();

		const sdk = new AngieMcpSdk( { appId: ADMIN_PAGES_ANGIE_APP_ID } );

		await sdk.loadSidebarV2( {
			container: {
				layout: LAYOUT_SIDEBAR,
				styleTheme: 'wordpress',
				create: true,
				persistOpenState: false,
				resizable: false,
			},
			callbacks: {
				onToggle: saveSidebarState,
			},
			widgetConfig: {
				localServers: {
					skipLoading: true,
				},
			},
		} );

		enableEndSideResize();
		isSdkBooted = true;

		return sdk;
	} )().catch( ( error ) => {
		sdkBootPromise = null;
		throw error;
	} );

	return sdkBootPromise;
};

const sendPromptToSdk = async ( prompt ) => {
	await openSdkSidebar();

	const sdk = await sdkBootPromise;

	await sdk.waitForReady();
	await sdk.triggerAngie( { prompt, context: { source: ADMIN_PAGES_ANGIE_APP_ID } } );
};

const openSdkSidebar = async () => {
	await bootSdk();

	window.toggleAngieSidebar?.( true );
};

export const resetAngieSdkForTests = () => {
	sdkBootPromise = null;
	isSdkBooted = false;
};

export const restoreSdkSidebar = () => {
	if ( ! wasSidebarLeftOpen() ) {
		return Promise.resolve();
	}

	return openSdkSidebar();
};

export const toggleSdkSidebar = () => {
	if ( ! isSdkBooted ) {
		return openSdkSidebar();
	}

	window.toggleAngieSidebar?.();

	return Promise.resolve();
};

export const openAngieWithPrompt = ( prompt ) => {
	if ( getAngieIframe() || isAngiePluginAvailable() ) {
		sendPromptToPlugin( prompt );
		return Promise.resolve();
	}

	return sendPromptToSdk( prompt );
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
		sendPromptToPlugin( prompt );
	} catch {
	}
};
