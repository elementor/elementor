import {
	createAngieMcpSdkInstance,
	LAYOUT_FLOATING_CHAT,
	type AngieMcpSdk,
	type LoadSidebarV2Options,
} from '@elementor/editor-mcp';
import { __ } from '@wordpress/i18n';

import {
	ANGIE_WIDGET_HIDDEN_CLASS,
	INLINE_TEXT_GENERATOR_APP_ID,
	INLINE_TEXT_GENERATOR_CONTAINER_ID,
	INLINE_TEXT_GENERATOR_INSTANCE_ID,
	INLINE_TEXT_GENERATOR_MCP_SERVER_NAME,
} from './constants';
import { createInlineTextGeneratorMcpServer } from './create-inline-text-generator-mcp-server';

const INLINE_TEXT_GENERATION_PROMPT = __(
	'Improve or generate text for the active inline-editing field. First call get_active_inline_text to read the current HTML, then use apply_generated_inline_text with your result. Preserve meaningful inline formatting where appropriate.',
	'elementor'
);

let sdk: AngieMcpSdk | null = null;
let bootPromise: Promise< AngieMcpSdk > | null = null;

export const getInlineTextGeneratorLoadSidebarOptions = (): LoadSidebarV2Options => ( {
	host: {
		appId: INLINE_TEXT_GENERATOR_APP_ID,
		instanceId: INLINE_TEXT_GENERATOR_INSTANCE_ID,
	},
	container: {
		id: INLINE_TEXT_GENERATOR_CONTAINER_ID,
		layout: LAYOUT_FLOATING_CHAT,
	},
	widgetConfig: {
		title: __( 'Inline text generator', 'elementor' ),
		featuredMcpServer: INLINE_TEXT_GENERATOR_MCP_SERVER_NAME,
		localServers: { skipLoading: true },
		modeSwitcher: { enabled: false, default: 'agent' },
	},
} );

const openInlineTextGeneratorContainer = () => {
	const container = document.getElementById( INLINE_TEXT_GENERATOR_CONTAINER_ID );

	if ( container ) {
		container.classList.remove( ANGIE_WIDGET_HIDDEN_CLASS );
	}
};

export const resetInlineTextGeneratorBootStateForTests = () => {
	sdk = null;
	bootPromise = null;
};

export const bootInlineTextGeneratorSdk = async (): Promise< AngieMcpSdk > => {
	if ( sdk ) {
		return sdk;
	}

	if ( bootPromise ) {
		return bootPromise;
	}

	bootPromise = ( async () => {
		try {
			const instance = createAngieMcpSdkInstance();

			await instance.loadSidebarV2( getInlineTextGeneratorLoadSidebarOptions() );
			await instance.waitForReady();
			await instance.registerServer( {
				name: INLINE_TEXT_GENERATOR_MCP_SERVER_NAME,
				version: '1.0.0',
				description: __( 'Inline text generation for atomic inline editing.', 'elementor' ),
				server: createInlineTextGeneratorMcpServer(),
				capabilities: {
					tools: {},
				},
			} );

			sdk = instance;

			return instance;
		} catch ( error ) {
			bootPromise = null;
			sdk = null;
			throw error;
		}
	} )();

	return bootPromise;
};

export const openInlineTextGeneratorWithPrompt = async () => {
	const instance = await bootInlineTextGeneratorSdk();

	openInlineTextGeneratorContainer();

	await instance.triggerAngie( {
		prompt: INLINE_TEXT_GENERATION_PROMPT,
		context: {
			source: INLINE_TEXT_GENERATOR_APP_ID,
		},
		options: {
			newChat: true,
		},
	} );
};
