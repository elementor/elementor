import { getWidgetsCache } from '@elementor/editor-elements';
import { type MCPRegistryEntry, ResourceTemplate } from '@elementor/editor-mcp';
import { getStylesSchema } from '@elementor/editor-styles';

export const WIDGET_SCHEMA_URI = 'elementor://widgets/schema/{widgetType}';
export const STYLE_SCHEMA_URI = 'elementor://styles/schema/{category}';

export const initWidgetsSchemaResource = ( reg: MCPRegistryEntry ) => {
	const { mcpServer } = reg;

	mcpServer.resource(
		'styles-schema',
		new ResourceTemplate( STYLE_SCHEMA_URI, {
			list: () => {
				const categories = Object.keys( getStylesSchema() );
				return {
					resources: categories.map( ( category ) => ( {
						uri: `elementor://styles/schema/${ category }`,
						name: 'Style schema for ' + category,
					} ) ),
				};
			},
		} ),
		{
			description: 'Common styles schema for the specified category',
		},
		async ( uri, variables ) => {
			const category = typeof variables.category === 'string' ? variables.category : variables.category?.[ 0 ];
			const stylesSchema = getStylesSchema()[ category ];
			if ( ! stylesSchema ) {
				throw new Error( `No styles schema found for category: ${ category }` );
			}
			return {
				contents: [
					{
						uri: uri.toString(),
						text: JSON.stringify( stylesSchema ),
					},
				],
			};
		}
	);

	mcpServer.resource(
		'widget-schema-by-type',
		new ResourceTemplate( WIDGET_SCHEMA_URI, {
			list: () => {
				const cache = getWidgetsCache() || {};
				const availableWidgets = Object.keys( cache || {} ).filter(
					( widgetType ) => cache[ widgetType ]?.atomic_props_schema
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
		async ( uri, variables ) => {
			const widgetType =
				typeof variables.widgetType === 'string' ? variables.widgetType : variables.widgetType?.[ 0 ];
			const propSchema = getWidgetsCache()?.[ widgetType ]?.atomic_props_schema;
			if ( ! propSchema ) {
				throw new Error( `No prop schema found for element type: ${ widgetType }` );
			}
			return {
				contents: [
					{
						uri: uri.toString(),
						text: JSON.stringify( propSchema ),
					},
				],
			};
		}
	);
};
