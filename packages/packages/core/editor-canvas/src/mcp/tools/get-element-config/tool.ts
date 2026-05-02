import { getContainer, getElementStyles, getWidgetsCache, type V1Element } from '@elementor/editor-elements';
import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { type PropValue, Schema } from '@elementor/editor-props';
import { z } from '@elementor/schema';

const schema = {
	elementId: z.string(),
};

const outputSchema = {
	properties: z
		.record( z.string(), z.any() )
		.describe( 'A record mapping PropTypes to their corresponding PropValues' ),
	style: z
		.record( z.string(), z.any() )
		.describe( 'A record mapping StyleSchema properties to their corresponding PropValues' ),
	childElements: z
		.array(
			z.object( {
				id: z.string(),
				elementType: z.string(),
				childElements: z
					.array( z.any() )
					.describe( 'An array of child element IDs, when applicable, same structure recursively' ),
			} )
		)
		.describe( 'An array of child element IDs, when applicable, with recursive structure' ),
};
type ElementStructure = {
	id: string;
	elementType: string;
	childElements: ElementStructure[];
};
const structuredElements = ( element: V1Element ): ElementStructure[] => {
	const children = element.children || [];
	return children.map( ( child ) => {
		return {
			id: child.id,
			elementType: child.model.get( 'elType' ) || child.model.get( 'widgetType' ) || 'unknown',
			childElements: structuredElements( child ),
		};
	} );
};

export const initGetElementConfigTool = ( reg: MCPRegistryEntry ) => {
	const { addTool } = reg;

	addTool( {
		name: 'get-element-configuration-values',
		description: "Retrieve the element's configuration PropValues for a specific element by unique ID.",
		schema,
		outputSchema,
		modelPreferences: {
			intelligencePriority: 0.6,
			speedPriority: 0.9,
		},
		handler: async ( { elementId } ) => {
			const element = getContainer( elementId );
			if ( ! element ) {
				throw new Error( `Element with ID ${ elementId } not found.` );
			}
			const elementType = element.model.get( 'widgetType' ) || element.model.get( 'elType' ) || '';
			const widgetData = getWidgetsCache()?.[ elementType ];
			if ( ! widgetData ) {
				throw new Error(
					`Unknown element type: ${ elementType }. Check the available-widgets resource for valid types.`
				);
			}
			if ( ! widgetData.atomic_props_schema ) {
				throw new Error(
					`This tool does not support V3 elements. Please use the elementor-v3-mcp tools instead for element type: ${ elementType }`
				);
			}
			const elementRawSettings = element.settings;
			const propSchema = getWidgetsCache()?.[ elementType ]?.atomic_props_schema;

			if ( ! elementRawSettings || ! propSchema ) {
				throw new Error( `No settings or prop schema found for element ID: ${ elementId }` );
			}

			const propValues: Record< string, PropValue > = {};
			const stylePropValues: Record< string, PropValue > = {};

			Schema.configurableKeys( propSchema ).forEach( ( key ) => {
				propValues[ key ] = structuredClone( elementRawSettings.get( key ) );
			} );
			const elementStyles = getElementStyles( elementId ) || {};
			const localStyle = Object.values( elementStyles ).find( ( style ) => style.label === 'local' );

			if ( localStyle ) {
				const defaultVariant = localStyle.variants.find(
					( variant ) => variant.meta.breakpoint === 'desktop' && ! variant.meta.state
				);
				if ( defaultVariant ) {
					const styleProps = defaultVariant.props || {};
					Object.keys( styleProps ).forEach( ( stylePropName ) => {
						if ( typeof styleProps[ stylePropName ] !== 'undefined' ) {
							stylePropValues[ stylePropName ] = structuredClone( styleProps[ stylePropName ] );
						}
					} );
					if ( defaultVariant.custom_css ) {
						stylePropValues.custom_css = atob( defaultVariant.custom_css.raw );
					}
				}
			}

			return {
				properties: {
					...propValues,
				},
				style: {
					...stylePropValues,
				},
				childElements: structuredElements( element ),
			};
		},
	} );
};
