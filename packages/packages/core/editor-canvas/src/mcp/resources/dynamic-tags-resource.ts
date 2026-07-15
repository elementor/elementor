import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { type HttpResponse, httpService } from '@elementor/http-client';

export const DYNAMIC_TAGS_URI = 'elementor://dynamic-tags';

const MCP_PROXY_URL = 'elementor/v1/mcp-proxy';

type DynamicTagEntry = {
	name: string;
	label: string;
	categories: string[];
	settings: Record< string, unknown >;
};

const fetchDynamicTags = async (): Promise< DynamicTagEntry[] > => {
	const { data } = await httpService().post< HttpResponse< DynamicTagEntry[] > >( MCP_PROXY_URL, {
		tool: 'list-dynamic-tags',
		input: {},
	} );

	return data.data ?? [];
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
			const tags = await fetchDynamicTags();

			return {
				contents: [
					{
						uri: uri.href,
						mimeType: 'application/json',
						text: JSON.stringify( tags ),
					},
				],
			};
		}
	);
};
