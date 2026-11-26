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

const PROMPT_HASH_KEY = 'angie-prompt';
const PENDING_PROMPT_STORAGE_KEY = 'elementor_agent_ready_pending_angie_prompt';
const ANGIE_ACTIVATION_RETURN_PARAM = 'open-angie';
const ANGIE_READY_TIMEOUT_MS = 10000;
const ADMIN_PAGES_ANGIE_APP_ID = 'elementor-admin-pages';
const END_SIDE_STYLES_ID = 'e-admin-pages-angie-end-side';
const END_SIDE_STYLES = `
@media (min-width: 768px) {
	html body.angie-sidebar-active {
		padding-inline-start: 0 !important;
		padding-inline-end: var(--angie-sidebar-width) !important;
	}

	body #angie-sidebar-container {
		inset-inline-start: auto;
		inset-inline-end: 0;
		--angie-sidebar-hide-transform: translateX(100%);
	}

	[dir="rtl"] body #angie-sidebar-container {
		--angie-sidebar-hide-transform: translateX(-100%);
	}
}
`;

const SIDEBAR_STATE_STORAGE_KEY = 'elementor_admin_pages_angie_sidebar_state';
const SIDEBAR_STATE_OPEN = 'open';
const SIDEBAR_STATE_CLOSED = 'closed';

let sdkBootPromise = null;

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

const dockSidebarToEndSide = () => {
	if ( document.getElementById( END_SIDE_STYLES_ID ) ) {
		return;
	}

	const style = document.createElement( 'style' );
	style.id = END_SIDE_STYLES_ID;
	style.textContent = END_SIDE_STYLES;
	document.head.appendChild( style );
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
		dockSidebarToEndSide();

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
};

export const restoreSdkSidebar = () => {
	if ( ! wasSidebarLeftOpen() ) {
		return Promise.resolve();
	}

	return openSdkSidebar();
};

export const toggleSdkSidebar = () => {
	if ( ! sdkBootPromise ) {
		return openSdkSidebar();
	}

	return sdkBootPromise.then( () => window.toggleAngieSidebar?.() );
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
