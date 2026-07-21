import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { type HttpResponse, httpService } from '@elementor/http-client';

const MCP_PROXY_URL = 'elementor/v1/mcp-proxy';

export const AVAILABLE_WIDGETS_URI = 'elementor://context/available-widgets';
export const AVAILABLE_WIDGETS_URI_V4 = 'elementor://context/available-widgets/v4';

type WidgetSummary = {
	type: string;
	description?: string;
};

type WidgetSummaryResponse = {
	widgets: WidgetSummary[];
};

const fetchWidgets = async (): Promise< WidgetSummary[] > => {
	const { data } = await httpService().post< HttpResponse< WidgetSummaryResponse > >( MCP_PROXY_URL, {
		tool: 'list-widget-schemas',
		input: { summary: true },
	} );

	return data.data?.widgets ?? [];
};

const buildContents = async ( uri: string ) => {
	const widgets = await fetchWidgets();

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
		async () => buildContents( AVAILABLE_WIDGETS_URI_V4 )
	);

	resource(
		'available-widgets',
		AVAILABLE_WIDGETS_URI,
		{
			description: 'All registered v4 widget types with description.',
		},
		async () => buildContents( AVAILABLE_WIDGETS_URI )
	);
};
