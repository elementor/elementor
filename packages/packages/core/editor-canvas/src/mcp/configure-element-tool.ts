import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { z } from '@elementor/schema';

import { doUpdateElementProperty } from './utils/do-update-element-property';

export const initConfigureElementTool = ( reg: MCPRegistryEntry ) => {
	const { addTool } = reg;

	addTool( {
		name: 'configure-element',
		description: `Configure an existing element on the page, or retreiving the configuration schema of an element.

Before using this tool, check the definitions of the elements PropTypes at the resource "widget-schema-by-type" at editor-canvas__elementor://widgets/schema/{widgetType}
All widgets share a common _style property for styling, which uses the common styles schema.
Retreive and check the common styles schema at the resource list "styles-schema" at editor-canvas__elementor://styles/schema/{category}

# When to use this tool
When a user requires to change anything in an element, such as updating text, colors, sizes, or other configurable properties.
This tool handles elements of type "widget".
This tool handles styling elements, using the _styles property in the configuration.

The element's schema must be known before using this tool.

Attached resource link describing how PropType schema should be parsed as PropValue for this tool.

Read carefully the PropType Schema of the element and it's styles, then apply correct PropValue according to the schema.

PropValue structure:
{
		"$$type": string, // MANDATORY as defined in the PropType schema under the "key" property
		value: unknown // The value according to the PropType schema for kinds of "array", use array with PropValues items inside. For "object", read the shape property of the PropType schema. For "plain", use strings.
}

<IMPORTANT>
ALWAYS MAKE SURE you have the PropType schemas for the element you are configuring, and the common-styles schema for styling. If you are not sure, retreive the schema from the resources mentioned above.
</IMPORTANT>

You can use multiple property changes at once by providing multiple entries in the propertiesToChange object, including _style alongside non-style props.
Some properties are nested, use the root property name, then objects with nested values inside, as the complete schema suggests.
Nested properties, such as for the _styles, should include a "_styles" property with object containing the definitions to change.

Make sure you have the "widget-schema-by-type" resource available to retreive the PropType schema for the element type you are configuring.

# How to configure elements
We use a dedicated PropType Schema for configuring elements, including styles. When you configure an element, you must use the EXACT PropType Value as defined in the schema.
For _styles, use the style schema provided, as it also uses the PropType format.
For all non-primitive types, provide the key property as defined in the schema as $$type in the generated objecct, as it is MANDATORY for parsing.

Use the EXACT "PROP-TYPE" Schema given, and ALWAYS include the "key" property from the original configuration for every property you are changing.

# Example
\`\`\`json
{
	propertiesToChange: {
		title: {
			$$type: 'string',
			value: 'New Title Text'
		},
		border: {
			$$type: 'boolean',
			value: false
		},
		_styles: {
			'line-height': {
				$$type: 'size',
				value: {
					size: {
						$$type: 'number',
						value: 20
					},
					unit: {
						$$type: 'string',
						value: 'px'
					}
				}
			}
		}
	}
};
\`\`\`

<IMPORTANT>
The $$type property is MANDATORY for every value, it is required to parse the value and apply application-level effects.
</IMPORTANT>


`,
		schema: {
			propertiesToChange: z
				.record(
					z
						.string()
						.describe(
							'The property name. If nested property, provide the root property name, and the object delta only.'
						),
					z.any().describe( "The property's value" )
				)
				.describe( 'An object containing property names and their new values to be set on the element' )
				.optional(),
			elementType: z.string().describe( 'The type of the element to retreive the schema' ),
			elementId: z.string().describe( 'The unique id of the element to configure' ),
		},
		outputSchema: {
			success: z
				.boolean()
				.describe(
					'Whether the configuration change was successful, only if propertyName and propertyValue are provided'
				),
		},
		handler: ( { elementId, propertiesToChange, elementType } ) => {
			if ( ! propertiesToChange ) {
				throw new Error(
					'propertiesToChange is required to configure an element. Now that you have this information, ensure you have the schema and try again.'
				);
			}
			const toUpdate = Object.entries( propertiesToChange );
			for ( const [ propertyName, propertyValue ] of toUpdate ) {
				if ( ! propertyName && ! elementId && ! elementType ) {
					throw new Error(
						'propertyName, elementId, elementType are required to configure an element. If you want to retreive the schema, use the get-element-configuration-schema tool.'
					);
				}

				doUpdateElementProperty( {
					elementId,
					elementType,
					propertyName,
					propertyValue,
				} );
			}
			return {
				success: true,
			};
		},
	} );
};
