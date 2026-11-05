import { openAngieInAskMode } from '@elementor/editor-mcp';
import { AngieInteractionMode, type AngieTriggerRequest, setAngieInteractionMode } from '@elementor-external/angie-sdk';

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

let openPanel = () => {};

export const registerAngiePanelOpener = ( opener: () => void ) => {
	openPanel = opener;
};

export const resetAngiePanelOpenerForTests = () => {
	openPanel = () => {};
};

const openPluginAngie = ( request: OpenAngieRequest ): void => {
	openAngieInAskMode( request.prompt );

	if ( request.mode !== AngieInteractionMode.ASK ) {
		setAngieInteractionMode( request.mode );
	}
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
