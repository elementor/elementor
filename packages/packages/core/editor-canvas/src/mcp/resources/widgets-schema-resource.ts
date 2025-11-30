import { getWidgetsCache } from '@elementor/editor-elements';
import { type MCPRegistryEntry, ResourceTemplate } from '@elementor/editor-mcp';
import {
	type ArrayPropType,
	type ObjectPropType,
	type PropType,
	Schema,
	type TransformablePropType,
	type UnionPropType,
} from '@elementor/editor-props';
import { getStylesSchema } from '@elementor/editor-styles';

export const WIDGET_SCHEMA_URI = 'elementor://widgets/schema/{widgetType}';
export const STYLE_SCHEMA_URI = 'elementor://styles/schema/{category}';
export const GLOBAL_VARIABLES_URI = 'elementor://variables';
export const GLOBAL_CLASSES_URI = 'elementor://classes';
export const BEST_PRACTICES_URI = 'elementor://styles/best-practices';

export const initWidgetsSchemaResource = ( reg: MCPRegistryEntry ) => {
	const { mcpServer } = reg;

	mcpServer.resource( 'styles-best-practices', BEST_PRACTICES_URI, async () => {
		return {
			contents: [
				{
					uri: BEST_PRACTICES_URI,
					text: `# Styling best practices
Prefer using "em" and "rem" values for text-related sizes, padding and spacing. Use percentages for dynamic sizing relative to parent containers.
This flexboxes are by default "flex" with "stretch" alignment. To ensure proper layout, define the "justify-content" and "align-items" as in the schema.`,
				},
			],
		};
	} );

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
			const cleanedupPropSchema = cleanupPropType( stylesSchema );
			const asJson = Schema.propTypeToJsonSchema( cleanedupPropSchema as PropType );
			return {
				contents: [
					{
						uri: uri.toString(),
						text: JSON.stringify( asJson ),
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
			const cleanedupPropSchema = cleanupPropSchema( propSchema );
			const asJson = Object.fromEntries(
				Object.entries( cleanedupPropSchema ).map( ( [ key, propType ] ) => [
					key,
					Schema.propTypeToJsonSchema( propType ),
				] )
			);
			Schema.nonConfigurablePropKeys.forEach( ( key ) => {
				// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
				delete asJson[ key ];
			} );

			return {
				contents: [
					{
						uri: uri.toString(),
						text: JSON.stringify( asJson ),
					},
				],
			};
		}
	);

	mcpServer.resource(
		'global-variables',
		new ResourceTemplate( GLOBAL_VARIABLES_URI, {
			list: () => {
				return {
					resources: [
						{
							uri: GLOBAL_VARIABLES_URI,
							name: 'Global variables',
						},
					],
				};
			},
		} ),
		{
			description:
				'Global variables list. Variables are being used in this way: If it is directly in the schema, you need to put the ID which is the key inside the object.',
		},
		async ( uri ) => {
			return {
				contents: [ { uri: uri.toString(), text: localStorage[ 'elementor-global-variables' ] } ],
			};
		}
	);

	mcpServer.resource(
		'global-classes',
		new ResourceTemplate( GLOBAL_CLASSES_URI, {
			list: () => {
				return {
					resources: [ { uri: GLOBAL_CLASSES_URI, name: 'Global classes' } ],
				};
			},
		} ),
		{
			description: 'Global classes list.',
		},
		async ( uri ) => {
			return {
				contents: [ { uri: uri.toString(), text: localStorage[ 'elementor-global-classes' ] ?? {} } ],
			};
		}
	);

	window.addEventListener( 'variables:updated', () => {
		mcpServer.server.sendResourceUpdated( {
			uri: GLOBAL_VARIABLES_URI,
			contents: [ { uri: GLOBAL_VARIABLES_URI, text: localStorage[ 'elementor-global-variables' ] } ],
		} );
	} );
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
