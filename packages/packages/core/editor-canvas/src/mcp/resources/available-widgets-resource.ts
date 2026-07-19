import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { type HttpResponse, httpService } from '@elementor/http-client';

const MCP_PROXY_URL = 'elementor/v1/mcp-proxy';

export const AVAILABLE_WIDGETS_URI = 'elementor://context/available-widgets';
export const AVAILABLE_WIDGETS_URI_V4 = 'elementor://context/available-widgets/v4';

type WidgetSummary = {
	type: string;
	version: 'v3' | 'v4';
	description?: string;
};

const fetchWidgets = async ( version?: WidgetSummary[ 'version' ] ): Promise< WidgetSummary[] > => {
	const { data } = await httpService().post< HttpResponse< WidgetSummary[] > >( MCP_PROXY_URL, {
		tool: 'list-widgets',
		input: version ? { version } : {},
	} );

	return data.data ?? [];
};

const buildContents = async ( uri: string, version?: WidgetSummary[ 'version' ] ) => {
	const widgets = await fetchWidgets( version );

	return {
		contents: [
			{
				uri,
				mimeType: 'application/json',
				text: JSON.stringify( widgets, null, 2 ),
			},
		],
	};
};

export const initAvailableWidgetsResource = ( reg: MCPRegistryEntry ) => {
	const { resource } = reg;

	resource(
		'available-widgets-v4',
		AVAILABLE_WIDGETS_URI_V4,
		{
			description: 'All registered v4 version widgets',
		},
		async () => buildContents( AVAILABLE_WIDGETS_URI_V4, 'v4' )
	);

	resource(
		'available-widgets',
		AVAILABLE_WIDGETS_URI,
		{
			description: 'All registered widget types with v3/v4 version metadata and description.',
		},
		async () => buildContents( AVAILABLE_WIDGETS_URI )
	);
};
