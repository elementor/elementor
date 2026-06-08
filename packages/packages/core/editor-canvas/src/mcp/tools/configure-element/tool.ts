import { getWidgetsCache } from '@elementor/editor-elements';
import { type MCPRegistryEntry } from '@elementor/editor-mcp';

import { DYNAMIC_TAGS_URI } from '../../resources/dynamic-tags-resource';
import { WIDGET_SCHEMA_URI } from '../../resources/widgets-schema-resource';
import { convertCssToAtomic } from '../../utils/convert-css-to-atomic';
import { doUpdateElementProperty } from '../../utils/do-update-element-property';
import { validateInput } from '../../utils/validate-input';
import { CONFIGURE_ELEMENT_GUIDE_URI, generatePrompt } from './prompt';
import { inputSchema as schema, outputSchema } from './schema';

export const initConfigureElementTool = ( reg: MCPRegistryEntry ) => {
	const { addTool, resource } = reg;

	resource(
		'configure-element-guide',
		CONFIGURE_ELEMENT_GUIDE_URI,
		{
			title: 'Configure Element Guide',
			description: 'Detailed guide for using the configure-element tool',
			mimeType: 'text/plain',
		},
		async ( uri: URL ) => ( {
			contents: [ { uri: uri.href, mimeType: 'text/plain', text: generatePrompt() } ],
		} )
	);

	addTool( {
		name: 'configure-element',
		description: "Configure an existing V4 element's properties and styles. Read the guide resource before use.",
		schema,
		outputSchema,
		requiredResources: [
			{ description: 'Widgets schema', uri: WIDGET_SCHEMA_URI },
			{ description: 'Configure element guide', uri: CONFIGURE_ELEMENT_GUIDE_URI },
			{ description: 'Dynamic tags catalog', uri: DYNAMIC_TAGS_URI },
		],
		handler: async ( { elementId, propertiesToChange, elementType, style } ) => {
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
			const toUpdate = Object.entries( propertiesToChange );
			const { valid, errors } = validateInput.validatePropSchema( elementType, propertiesToChange );
			if ( ! valid ) {
				const errorMessage = `Failed to configure element "${ elementId }" due to invalid properties: ${ errors?.join(
					'\n- '
				) }`;
				throw new Error( errorMessage );
			}
			for ( const [ propertyName, propertyValue ] of toUpdate ) {
				try {
					doUpdateElementProperty( {
						elementId,
						elementType,
						propertyName,
						propertyValue,
					} );
				} catch ( error ) {
					const errorMessage = createUpdateErrorMessage( {
						propertyName,
						elementId,
						elementType,
						error: error as Error,
						propertyType: 'prop',
					} );
					throw new Error( errorMessage );
				}
			}
			await applyStyleFromCss( { elementId, elementType, style } );
			return {
				success: true,
			};
		},
	} );
};

async function applyStyleFromCss( opts: { elementId: string; elementType: string; style: Record< string, string > } ) {
	const { elementId, elementType, style } = opts;
	if ( ! style || Object.keys( style ).length === 0 ) {
		return;
	}
	const { props, customCss } = await convertCssToAtomic( style );
	const styleValue: Record< string, unknown > = { ...props };
	if ( customCss ) {
		styleValue.custom_css = customCss;
	}
	if ( Object.keys( styleValue ).length === 0 ) {
		return;
	}
	try {
		doUpdateElementProperty( {
			elementId,
			elementType,
			propertyName: '_styles',
			propertyValue: styleValue,
		} );
	} catch ( error ) {
		throw new Error(
			createUpdateErrorMessage( {
				propertyName: '(style)',
				elementId,
				elementType,
				propertyType: 'style',
				error: error as Error,
			} )
		);
	}
}

function createUpdateErrorMessage( opts: {
	propertyName: string;
	elementId: string;
	elementType: string;
	error: Error;
	propertyType: 'prop' | 'style';
} ) {
	const { propertyName, elementId, elementType, error, propertyType } = opts;
	return `Failed to update property "${ propertyName }" on element "${ elementId }": ${ error.message }.
${
	propertyType === 'prop'
		? `
Check the element's PropType schema at the resource [${ WIDGET_SCHEMA_URI.replace(
				'{widgetType}',
				elementType
		  ) }] for type "${ elementType }" to ensure the property exists and the value matches the expected PropType.
Now that you have this information, ensure you have the schema and try again.`
		: `
Provide styling as raw CSS via the "style" parameter (a flat map of CSS property → value). Declarations that cannot be converted are stored as the element custom CSS.`
};
}`;
}
