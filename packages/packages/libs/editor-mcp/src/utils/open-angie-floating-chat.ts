import {
	DEFAULT_CONTAINER_ID,
	getAngieIframe,
	LAYOUT_FLOATING_CHAT,
	toggleAngieSidebar,
	type WidgetConfig,
} from '@elementor-external/angie-sdk';

import { registerAngieMcpServers } from '../mcp-registry';
import { getSDK } from './get-sdk';

export type OpenAngieFloatingChatArgs = {
	appId: string;
	prompt: string;
	source: string;
	mcpServers: string[];
	anchorElement?: HTMLElement | null;
	aiContext?: Record< string, unknown >;
	widgetConfig?: WidgetConfig;
};

const NO_CHAT_TOGGLE_BUTTON = { enabled: false, selector: '' };

const CHAT_WIDTH = 360;
const CHAT_HEIGHT = 480;
const CHAT_GAP = 8;

let bootPromise: Promise< void > | null = null;

const clamp = ( value: number, min: number, max: number ) => Math.max( min, Math.min( value, Math.max( min, max ) ) );

const anchorChatTo = ( anchorElement: HTMLElement ) => {
	const container = document.getElementById( DEFAULT_CONTAINER_ID );

	if ( ! container ) {
		return;
	}

	const anchor = anchorElement.getBoundingClientRect();
	const left = clamp( anchor.right + CHAT_GAP, CHAT_GAP, window.innerWidth - CHAT_WIDTH - CHAT_GAP );
	const top = clamp( anchor.top, CHAT_GAP, window.innerHeight - CHAT_HEIGHT - CHAT_GAP );

	const position: Record< string, string > = {
		top: `${ top }px`,
		left: `${ left }px`,
		bottom: 'auto',
		right: 'auto',
		'inset-inline-end': 'auto',
		width: `${ CHAT_WIDTH }px`,
		height: `${ CHAT_HEIGHT }px`,
	};

	Object.entries( position ).forEach( ( [ property, value ] ) => {
		container.style.setProperty( property, value, 'important' );
	} );
};

export const openAngieFloatingChat = async ( {
	appId,
	prompt,
	source,
	mcpServers,
	anchorElement,
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

	if ( anchorElement ) {
		anchorChatTo( anchorElement );
	}

	const iframe = getAngieIframe();
	if ( iframe ) {
		toggleAngieSidebar( iframe, true );
	}

	await registerAngieMcpServers( mcpServers );

	await getSDK().triggerAngie( {
		prompt,
		context: { source },
		options: { newChat: true },
	} );
};
