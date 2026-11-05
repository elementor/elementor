import type { AngieMcpSdk } from '@elementor-external/angie-sdk';
import { WpSearchMcpServer } from '@elementor-external/wp-search-mcp';

import { isAngiePluginActive } from './is-angie-plugin-active';

const HELP_CENTER_URL = 'https://elementor.com/help';
const HELP_CENTER_SERVER_NAME = 'elementor-help-center';
const HELP_CENTER_SERVER_VERSION = '1.2.0';
const HELP_CENTER_SERVER_DESCRIPTION =
	'Elementor Help Center MCP Server - help users find answers to their questions related to Elementor products and features';

export type HelpCenterAbility = {
	/**
	 * Registers the help-center ability on the Core SDK.
	 * The server exposes the help-center search, read, and response tools.
	 */
	register: ( sdk: AngieMcpSdk ) => Promise< void >;
};

export const helpCenterAbility: HelpCenterAbility = {
	async register( sdk ) {
		const helpCenter = new WpSearchMcpServer( {
			url: HELP_CENTER_URL,
			server: {
				name: HELP_CENTER_SERVER_NAME,
				title: 'Elementor Help Center',
				version: HELP_CENTER_SERVER_VERSION,
			},
			postTypes: {
				post: 'posts',
				page: 'pages',
				videos: 'videos',
			},
		} );

		await sdk.registerLocalServer( {
			name: HELP_CENTER_SERVER_NAME,
			version: HELP_CENTER_SERVER_VERSION,
			description: HELP_CENTER_SERVER_DESCRIPTION,
			server: helpCenter.server,
			capabilities: { tools: {} },
		} );
	},
};

let didRegister = false;

export const resetHelpCenterAbilityForTests = (): void => {
	didRegister = false;
};

/**
 * Registers the help-center ability on the Core SDK once.
 * Skipped while the Angie plugin is active, because that host already exposes it.
 *
 * @param sdk - Core Angie SDK instance that hosts the ability.
 */
export const ensureHelpCenterAbility = async ( sdk: AngieMcpSdk ): Promise< void > => {
	if ( isAngiePluginActive() || didRegister ) {
		return;
	}

	didRegister = true;

	try {
		await helpCenterAbility.register( sdk );
	} catch ( error ) {
		didRegister = false;
		throw error;
	}
};
