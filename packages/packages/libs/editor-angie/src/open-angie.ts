import { openAngieInAskMode } from '@elementor/editor-mcp';
import {
  AngieInteractionMode,
  type AngieTriggerRequest,
  setAngieInteractionMode,
} from '@elementor-external/angie-sdk';

import { bootAngieSdk, EDITOR_ANGIE_APP_ID, openAngieIframe } from './boot-angie-sdk';
import { ensureHelpCenterAbility } from './help-center-ability';
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

const openPluginAngie = ( request: OpenAngieRequest ): void => {
  openAngieInAskMode( request.prompt );

  if ( request.mode !== AngieInteractionMode.ASK ) {
    setAngieInteractionMode( request.mode );
  }
};

const openSdkAngie = async ( request: OpenAngieRequest ): Promise< void > => {
  const sdk = await bootAngieSdk();

  await ensureHelpCenterAbility( sdk );
  openAngieIframe();
  setAngieInteractionMode( request.mode );

  await sdk.triggerAngie( {
    prompt: request.prompt,
    context: request.sdk?.context ?? { source: EDITOR_ANGIE_APP_ID },
    options: request.sdk?.options,
  } );
};

/**
 * Opens Angie with the properties shared by both hosts.
 * Plugin-only and SDK-only arguments stay on `plugin` and `sdk`.
 * The Angie plugin wins when it is active. Otherwise the Core SDK opens.
 * @param request
 */
export const openAngie = async ( request: OpenAngieRequest ): Promise< void > => {
  if ( isAngiePluginActive() ) {
    openPluginAngie( request );
    return;
  }

  await openSdkAngie( request );
};
