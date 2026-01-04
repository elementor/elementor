import { getWidgetsCache } from '@elementor/editor-elements';
import { type MCPRegistryEntry, ResourceTemplate } from '@elementor/editor-mcp';
import {
	type ArrayPropType,
	type ObjectPropType,
	type Props,
	type PropType,
	Schema,
	type TransformablePropType,
	type UnionPropType,
} from '@elementor/editor-props';
import { getStylesSchema } from '@elementor/editor-styles';

export const WIDGET_SCHEMA_URI = 'elementor://widgets/schema/{widgetType}';
export const STYLE_SCHEMA_URI = 'elementor://styles/schema/{category}';
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
This flexboxes are by default "flex" with "stretch" alignment. To ensure proper layout, define the "justify-content" and "align-items" as in the schema.

When applicable for styles, apply style PropValues using the ${ STYLE_SCHEMA_URI }.
The css string must follow standard CSS syntax, with properties and values separated by semicolons, no selectors, or nesting rules allowed.`,
				},
			],
		};
	} );

	mcpServer.resource(
		'styles-schema',
		new ResourceTemplate( STYLE_SCHEMA_URI, {
			list: () => {
				const categories = [ ...Object.keys( getStylesSchema() ) ];
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
			const asJson = Schema.propTypeToJsonSchema( stylesSchema as PropType );
			return {
				contents: [
					{
						uri: uri.toString(),
						mimeType: 'application/json',
						text: JSON.stringify(
							Schema.enrichWithIntention( asJson, 'Desired CSS in format "property: value;"' )
						),
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
					( widgetType ) =>
						cache[ widgetType ]?.atomic_props_schema && cache[ widgetType ].meta?.llm_support !== false
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
			const widgetData = getWidgetsCache()?.[ widgetType ];
			const propSchema = widgetData?.atomic_props_schema;
			if ( ! propSchema || ! widgetData ) {
				throw new Error( `No prop schema found for element type: ${ widgetType }` );
			}
			const asJson = Object.fromEntries(
				Object.entries( propSchema ).map( ( [ key, propType ] ) => [
					key,
					Schema.propTypeToJsonSchema( propType ),
				] )
			);
			Schema.nonConfigurablePropKeys.forEach( ( key ) => {
				// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
				delete asJson[ key ];
			} );

			const description =
				typeof widgetData?.meta?.description === 'string' ? widgetData.meta.description : undefined;

			const defaultStyles: Record< string, Props > = {};
			const baseStyleSchema = widgetData?.base_styles;
			if ( baseStyleSchema ) {
				Object.values( baseStyleSchema ).forEach( ( stylePropType ) => {
					stylePropType.variants.forEach( ( variant ) => {
						Object.assign( defaultStyles, variant.props );
					} );
				} );
			}

			// build llm instructions
			const hasDefaultStyles = Object.keys( defaultStyles ).length > 0;
			const llmGuidance: Record< string, unknown > = {
				can_have_children: !! widgetData?.meta?.is_container,
			};

			if ( hasDefaultStyles ) {
				llmGuidance.instructions =
					'These are the default styles applied to the widget. Override only when necessary.';
				llmGuidance.default_styles = defaultStyles;
			}

			return {
				contents: [
					{
						uri: uri.toString(),
						mimeType: 'application/json',
						text: JSON.stringify( {
							type: 'object',
							properties: asJson,
							description,
							llm_guidance: llmGuidance,
						} ),
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
