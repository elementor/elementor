import { getWidgetsCache } from '@elementor/editor-elements';
import { type MCPRegistryEntry, ResourceTemplate } from '@elementor/editor-mcp';
import { type HttpResponse, httpService } from '@elementor/http-client';

import { isWidgetAvailableForLLM } from '../utils/element-data-util';

const MCP_PROXY_URL = 'elementor/v1/mcp-proxy';

export const CANVAS_SERVER_NAME = 'editor-canvas';

export const WIDGET_SCHEMA_URI = 'elementor://widgets/schema/{widgetType}';
export const WIDGET_SCHEMA_FULL_URI = `${ CANVAS_SERVER_NAME }_${ WIDGET_SCHEMA_URI }`;
export const STYLE_SCHEMA_URI = 'elementor://styles/schema/{category}';
export const BEST_PRACTICES_URI = 'elementor://style/best-practices';
export const BEST_PRACTICES_FULL_URI = `${ CANVAS_SERVER_NAME }_${ BEST_PRACTICES_URI }`;

export const initWidgetsSchemaResource = ( reg: MCPRegistryEntry ) => {
	const { resource } = reg;

	resource(
		'widget-schema-by-type',
		new ResourceTemplate( WIDGET_SCHEMA_URI, {
			list: () => {
				const cache = getWidgetsCache() || {};
				const availableWidgets = Object.keys( cache ).filter( ( widgetType ) =>
					isWidgetAvailableForLLM( cache[ widgetType ] )
				);

				return {
					resources: availableWidgets.map( ( widgetType ) => ( {
						uri: `elementor://widgets/schema/${ widgetType }`,
						name: 'Widget schema for ' + widgetType,
					} ) ),
				};
			},
		} ),
		{
			description: 'PropType schema for the specified widget type',
		},
		async ( uri ) => {
			const { data } = await httpService().get< HttpResponse< object > >( MCP_PROXY_URL, {
				params: { uri: uri.toString() },
			} );

			return {
				contents: [
					{
						uri: uri.toString(),
						mimeType: 'application/json',
						text: JSON.stringify( data.data ),
					},
				],
			};
		}
	);
};
