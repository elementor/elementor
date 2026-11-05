import {
	type AngieInteractionMode,
	type AngieTriggerRequest,
	MessageEventType,
	setAngieInteractionMode,
	toggleAngieSidebar,
} from '@elementor-external/angie-sdk';

import { bootAngieSdk, EDITOR_ANGIE_APP_ID, openAngieIframe } from './boot-angie-sdk';
import { isAngiePluginActive } from './is-angie-plugin-active';

/**
 * Fields both the Angie plugin host and the Core SDK accept.
 */
export type OpenAngieCommonProperties = {
	prompt: string;
	mode: AngieInteractionMode;
};

/**
 * Fields only the Core SDK accepts. They are not sent to the plugin.
 */
export type OpenAngieSdkProperties = {
	context?: AngieTriggerRequest[ 'context' ];
	options?: AngieTriggerRequest[ 'options' ];
};

/**
 * Fields only the Angie plugin host accepts. They are not sent to the Core SDK.
 * None yet.
 */
export type OpenAngiePluginProperties = Record< string, never >;

export type OpenAngieRequest = OpenAngieCommonProperties & {
	sdk?: OpenAngieSdkProperties;
	plugin?: OpenAngiePluginProperties;
};

/**
 * The Angie plugin boots this instance. The host SDK routes `SDK_TRIGGER_ANGIE`
 * by `payload.instanceId`, and `getAngieIframe()` only resolves instance #1.
 */
const PLUGIN_ANGIE_INSTANCE_ID = 'wp-admin';

/** Container id the plugin uses when it does not pass its own. */
const PLUGIN_ANGIE_CONTAINER_ID = 'angie-sidebar-container';

let openPanel = () => {};

export const registerAngiePanelOpener = ( opener: () => void ) => {
	openPanel = opener;
};

export const resetAngiePanelOpenerForTests = () => {
	openPanel = () => {};
};

const getPluginAngieIframe = (): HTMLIFrameElement | null => {
	const iframe = document.getElementById( PLUGIN_ANGIE_CONTAINER_ID )?.querySelector( 'iframe' );

	return iframe instanceof HTMLIFrameElement ? iframe : null;
};

const postToPluginIframe = ( iframe: HTMLIFrameElement, message: Record< string, unknown > ): void => {
	if ( ! iframe.contentWindow ) {
		return;
	}

	let targetOrigin: string;

	try {
		targetOrigin = new URL( iframe.src ).origin;
	} catch {
		return;
	}

	iframe.contentWindow.postMessage( message, targetOrigin );
};

const triggerPluginAngie = ( prompt: string ): void => {
	if ( ! prompt ) {
		return;
	}

	window.postMessage(
		{
			type: MessageEventType.SDK_TRIGGER_ANGIE,
			payload: {
				instanceId: PLUGIN_ANGIE_INSTANCE_ID,
				prompt,
			},
		},
		window.location.origin
	);
};

const openPluginAngie = ( request: OpenAngieRequest ): void => {
	const iframe = getPluginAngieIframe();

	if ( ! iframe ) {
		return;
	}

	toggleAngieSidebar( iframe, true, PLUGIN_ANGIE_CONTAINER_ID );
	postToPluginIframe( iframe, {
		type: MessageEventType.ANGIE_SET_INTERACTION_MODE,
		payload: { mode: request.mode },
	} );
	triggerPluginAngie( request.prompt );
};

const openSdkAngie = async ( request: OpenAngieRequest ): Promise< void > => {
	openPanel();

	const sdk = await bootAngieSdk();

	openAngieIframe();
	setAngieInteractionMode( request.mode );

	await sdk.triggerAngie( {
		prompt: request.prompt,
		context: request.sdk?.context ?? { source: EDITOR_ANGIE_APP_ID },
		options: request.sdk?.options,
	} );
};

/**
 * Opens Angie through one entry point.
 * The Angie plugin wins when it is active. Otherwise the Core SDK opens in the docked panel.
 *
 * @param request - Shared prompt and mode, plus host-specific `sdk` or `plugin` fields.
 */
export const openAngie = async ( request: OpenAngieRequest ): Promise< void > => {
	if ( isAngiePluginActive() ) {
		openPluginAngie( request );
		return;
	}

	await openSdkAngie( request );
};
