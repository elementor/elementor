import { type MCPRegistryEntry } from '@elementor/editor-mcp';

import { SUGGESTED_ACTIONS_HTML } from './suggested-actions-html';

export const SUGGESTED_ACTIONS_URI = 'ui://elementor/suggested-actions';
const SUGGESTED_ACTIONS_MIME = 'text/html;profile=mcp-app';

export const initSuggestedActionsResource = ( reg: MCPRegistryEntry ) => {
	const { resource } = reg;

	resource(
		'suggested-actions-ui',
		SUGGESTED_ACTIONS_URI,
		{
			description: 'Interactive MCP Apps view for rendering suggested next-step action chips.',
			mimeType: SUGGESTED_ACTIONS_MIME,
		},
		async ( uri: URL ) => ( {
			contents: [
				{
					uri: uri.href,
					mimeType: SUGGESTED_ACTIONS_MIME,
					text: SUGGESTED_ACTIONS_HTML,
				},
			],
		} )
	);
};
