import {
	getAngieIframe,
	LAYOUT_FLOATING_CHAT,
	toggleAngieSidebar,
	type WidgetConfig,
} from '@elementor-external/angie-sdk';

import { ensureAngieMcpAdapter } from '../mcp-registry';
import { getSDK } from './get-sdk';

export type OpenAngieFloatingChatArgs = {
	appId: string;
	prompt: string;
	source: string;
	aiContext?: Record< string, unknown >;
	widgetConfig?: WidgetConfig;
};

const NO_CHAT_TOGGLE_BUTTON = { enabled: false, selector: '' };

let bootPromise: Promise< void > | null = null;

export const openAngieFloatingChat = async ( {
	appId,
	prompt,
	source,
	aiContext,
	widgetConfig,
}: OpenAngieFloatingChatArgs ): Promise< void > => {
	if ( ! bootPromise ) {
		bootPromise = getSDK()
			.loadSidebarV2( {
				host: { appId, aiContext },
				container: {
					layout: LAYOUT_FLOATING_CHAT,
					chatToggleButton: NO_CHAT_TOGGLE_BUTTON,
				},
				widgetConfig,
			} )
			.catch( ( error ) => {
				bootPromise = null;
				throw error;
			} );
	}

	await bootPromise;

	const iframe = getAngieIframe();
	if ( iframe ) {
		toggleAngieSidebar( iframe, true );
	}

	await ensureAngieMcpAdapter();

	await getSDK().triggerAngie( {
		prompt,
		context: { source },
		options: { newChat: true },
	} );
};
