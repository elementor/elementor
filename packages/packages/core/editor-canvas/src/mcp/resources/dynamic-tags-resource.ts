import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { type HttpResponse, httpService } from '@elementor/http-client';

export const DYNAMIC_TAGS_URI = 'elementor://dynamic-tags';

const MCP_PROXY_URL = 'elementor/v1/mcp-proxy';

// NOTE: JSON-encoded array of dynamic tag entries; shape defined by List_Dynamic_Tags_Ability::execute() in modules/mcp/abilities/list-dynamic-tags-ability.php
const fetchDynamicTags = async (): Promise< string > => {
	const { data } = await httpService().get< HttpResponse< string > >( MCP_PROXY_URL, {
		params: { uri: DYNAMIC_TAGS_URI },
	} );

	return data.data ?? '[]';
};

export const initDynamicTagsResource = ( reg: MCPRegistryEntry ) => {
	const { resource } = reg;

	resource(
		'dynamic-tags',
		DYNAMIC_TAGS_URI,
		{
			description:
				'List of available dynamic tags. To bind a property to a dynamic source, set its value to ' +
				'{ "$$type": "dynamic", "value": { "name": <tag name>, "settings": { ... } } } using a tag whose ' +
				'name appears in that property\'s allowed list, and populate "settings" per the tag entry here.',
			mimeType: 'application/json',
		},
		async ( uri: URL ) => {
			return {
				contents: [
					{
						uri: uri.href,
						mimeType: 'application/json',
						text: await fetchDynamicTags(),
					},
				],
			};
		}
	);
};
