import { type MCPRegistryEntry, ResourceTemplate } from '@elementor/editor-mcp';
import { type HttpResponse, httpService } from '@elementor/http-client';

export const CANVAS_SERVER_NAME = 'editor-canvas';

export const WIDGET_SCHEMA_URI = 'elementor://widgets/schema/{widgetType}';
export const WIDGET_SCHEMA_FULL_URI = `${ CANVAS_SERVER_NAME }_${ WIDGET_SCHEMA_URI }`;
export const STYLE_SCHEMA_URI = 'elementor://styles/schema/{category}';
export const BEST_PRACTICES_URI = 'elementor://style/best-practices';
export const BEST_PRACTICES_FULL_URI = `${ CANVAS_SERVER_NAME }_${ BEST_PRACTICES_URI }`;

const MCP_PROXY_URL = 'elementor/v1/mcp-proxy';

type WidgetSummary = {
	type: string;
	description?: string;
};

type WidgetSummaryResponse = {
	widgets: WidgetSummary[];
};

const listWidgetTypes = async (): Promise< string[] > => {
	const { data } = await httpService().post< HttpResponse< WidgetSummaryResponse > >( MCP_PROXY_URL, {
		tool: 'list-widget-schemas',
		input: { summary: true },
	} );

	return ( data.data?.widgets ?? [] ).map( ( widget ) => widget.type );
};

const fetchWidgetSchema = async ( widgetType: string ): Promise< Record< string, unknown > > => {
	const { data } = await httpService().post< HttpResponse< Record< string, unknown > > >( MCP_PROXY_URL, {
		tool: 'get-widget-schema',
		input: { widget_type: widgetType },
	} );

	return data.data ?? {};
};

export const initWidgetsSchemaResource = ( reg: MCPRegistryEntry ) => {
	const { resource } = reg;

	resource(
		'widget-schema-by-type',
		new ResourceTemplate( WIDGET_SCHEMA_URI, {
			list: async () => {
				const widgetTypes = await listWidgetTypes();

				return {
					resources: widgetTypes.map( ( widgetType ) => ( {
						uri: `elementor://widgets/schema/${ widgetType }`,
						name: 'Widget schema for ' + widgetType,
					} ) ),
				};
			},
		} ),
		{
			description: 'PropType schema for the specified widget type',
		},
		async ( uri, variables ) => {
			const widgetType =
				typeof variables.widgetType === 'string' ? variables.widgetType : variables.widgetType?.[ 0 ];

			if ( ! widgetType ) {
				throw new Error( 'No widget type provided.' );
			}

			const schema = await fetchWidgetSchema( widgetType );

			return {
				contents: [
					{
						uri: uri.toString(),
						mimeType: 'application/json',
						text: JSON.stringify( schema ),
					},
				],
			};
		}
	);
};
