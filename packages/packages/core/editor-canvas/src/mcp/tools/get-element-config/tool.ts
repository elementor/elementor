import { getContainer, getElementStyles, getWidgetsCache } from '@elementor/editor-elements';
import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { type PropValue, Schema } from '@elementor/editor-props';
import { z } from '@elementor/schema';

const schema = {
	elementId: z.string(),
};

const outputSchema = {
	propValues: z
		.record( z.string(), z.any() )
		.describe(
			'A record mapping PropTypes to their corresponding PropValues, with _styles record for style-related PropValues'
		),
};

export const initGetElementConfigTool = ( reg: MCPRegistryEntry ) => {
	const { addTool } = reg;

	addTool( {
		name: 'get-element-configuration-values',
		description: "Retrieve the element's configuration PropValues for a specific element by unique ID.",
		schema,
		outputSchema,
		handler: async ( { elementId } ) => {
			const element = getContainer( elementId );
			if ( ! element ) {
				throw new Error( `Element with ID ${ elementId } not found.` );
			}
			const elementRawSettings = element.settings;
			const propSchema =
				getWidgetsCache()?.[ element.model.get( 'widgetType' ) || element.model.get( 'elType' ) || '' ]
					?.atomic_props_schema;

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
						stylePropValues.custom_css = btoa( defaultVariant.custom_css.raw );
					}
				}
			}

			return {
				propValues: {
					...propValues,
					_styles: stylePropValues,
				},
			};
		},
	} );
};
