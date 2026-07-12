import { type MCPRegistryEntry, ResourceTemplate } from '@elementor/editor-mcp';
import {
	type ArrayPropType,
	type ObjectPropType,
	type PropType,
	type TransformablePropType,
	type UnionPropType,
} from '@elementor/editor-props';
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
	version: 'v3' | 'v4';
	description?: string;
};

const listWidgetTypes = async (): Promise< string[] > => {
	const { data } = await httpService().post< HttpResponse< WidgetSummary[] > >( MCP_PROXY_URL, {
		tool: 'list-widgets',
		input: {},
	} );

	return ( data.data ?? [] ).map( ( widget ) => widget.type );
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

function cleanupPropSchema( propSchema: Record< string, PropType > ): Record< string, PropType > {
	const result: Record< string, Partial< PropType > > = {};
	Object.keys( propSchema ).forEach( ( propName ) => {
		result[ propName ] = cleanupPropType( propSchema[ propName ] );
	} );
	return result as Record< string, PropType >;
}
function cleanupPropType( propType: PropType & { key?: string } ): Partial< PropType > {
	const result: Partial< PropType > = {};
	Object.keys( propType ).forEach( ( property ) => {
		switch ( property ) {
			case 'key':
			case 'kind':
				( result as Record< string, unknown > )[ property ] = propType[ property ];
				break;
			case 'meta':
			case 'settings':
				{
					if ( Object.keys( propType[ property ] || {} ).length > 0 ) {
						( result as Record< string, unknown > )[ property ] = propType[ property ];
					}
				}
				break;
		}
	} );
	if ( result.kind === 'plain' ) {
		Object.defineProperty( result, 'kind', { value: 'string' } );
	} else if ( result.kind === 'array' ) {
		result.item_prop_type = cleanupPropType( ( propType as ArrayPropType ).item_prop_type ) as PropType;
	} else if ( result.kind === 'object' ) {
		const shape = ( propType as ObjectPropType ).shape as Record< string, PropType >;
		const cleanedShape = cleanupPropSchema( shape );
		result.shape = cleanedShape;
	} else if ( result.kind === 'union' ) {
		const propTypes = ( propType as UnionPropType ).prop_types;
		const cleanedPropTypes: Record< string, Partial< PropType > > = {};
		Object.keys( propTypes ).forEach( ( key ) => {
			cleanedPropTypes[ key ] = cleanupPropType( propTypes[ key ] );
		} );
		result.prop_types = cleanedPropTypes as Record< string, TransformablePropType >;
	}
	return result;
}
