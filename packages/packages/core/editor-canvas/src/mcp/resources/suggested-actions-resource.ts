import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { type HttpResponse, httpService } from '@elementor/http-client';

const MCP_PROXY_URL = 'elementor/v1/mcp-proxy';
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
		async ( uri: URL ) => {
			const { data } = await httpService().get< HttpResponse< string > >( MCP_PROXY_URL, {
				params: { uri: uri.href },
			} );

			return {
				contents: [
					{
						uri: uri.href,
						mimeType: SUGGESTED_ACTIONS_MIME,
						text: data.data,
					},
				],
			};
		}
	);
};
