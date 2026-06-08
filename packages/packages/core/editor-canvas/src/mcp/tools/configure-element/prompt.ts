import { toolPrompts } from '@elementor/editor-mcp';

import { WIDGET_SCHEMA_URI } from '../../resources/widgets-schema-resource';

export const CONFIGURE_ELEMENT_GUIDE_URI = 'elementor://canvas/tools/configure-element-guide';

export const generatePrompt = () => {
	const configureElementToolPrompt = toolPrompts( 'configure-element' );

	configureElementToolPrompt.description( `
Configure an existing element on the page.

# **CRITICAL - REQUIRED INFORMATION (Must read before using this tool)**
1. [${ WIDGET_SCHEMA_URI }]
   Required to understand which widgets are available, and what are their configuration schemas.
   Every widgetType (i.e. e-heading, e-button) that is supported has it's own property schema, that you must follow in order to apply parameter values correctly.
2. Styling is provided to this tool as raw CSS via the "style" parameter (a flat map of CSS property → value). The server converts it to native styles; any declaration that cannot be converted is stored as the element custom CSS automatically.
3. If not sure about the PropValues schema, you can use the "get-element-configuration-values" tool to retrieve the current PropValues configuration of the element.

Before using this tool, check the definitions of the elements PropTypes at the resource "widget-schema-by-type" at editor-canvas__elementor://widgets/schema/{widgetType}

# When to use this tool
When a user requires to change anything in an element, such as updating text, colors, sizes, or other configurable properties.
This tool handles elements of type "widget".
This tool handles styling elements, using the "style" parameter (raw CSS as a property → value map).

To CLEAR a property (i.e., set it to default or none), provide null as a value.

The element's schema must be known before using this tool.

Attached resource link describing how PropType schema should be parsed as PropValue for this tool.

Read carefully the PropType Schema of the element and it's styles, then apply correct PropValue according to the schema.

PropValue structure:
{
    "$$type": string, // MANDATORY as defined in the PropType schema under the "key" property
    value: unknown // The value according to the PropType schema for kinds of "array", use array with PropValues items inside. For "object", read the shape property of the PropType schema. For "plain", use strings.
}

<IMPORTANT>
ALWAYS MAKE SURE you have the PropType schemas for the element you are configuring. If you are not sure, retrieve the schema from the resources mentioned above.
</IMPORTANT>

You can use multiple property changes at once by providing multiple entries in the propertiesToChange object.
Some properties are nested, use the root property name, then objects with nested values inside, as the complete schema suggests.

Make sure you have the "widget-schema-by-type" resource available to retrieve the PropType schema for the element type you are configuring.

# How to configure elements
We use a dedicated PropType Schema for configuring element properties (propertiesToChange). When you configure an element property, you must use the EXACT PropType Value as defined in the schema.
For styling, use the "style" parameter with raw CSS declarations (property → value strings); do NOT use the PropType format for styles.
For all non-primitive property types, provide the key property as defined in the schema as $$type in the generated object, as it is MANDATORY for parsing.

Use the EXACT "PROP-TYPE" Schema given, and ALWAYS include the "key" property from the original configuration for every property you are changing.
` );

	configureElementToolPrompt.parameter( 'elementId', 'The ID of the element to configure. MANDATORY.' );

	configureElementToolPrompt.parameter(
		'elementType',
		'The type of the element to configure (i.e. e-heading, e-button). MANDATORY.'
	);

	configureElementToolPrompt.parameter(
		'propertiesToChange',
		'An object containing the properties to change, with their new values. MANDATORY. When updating a style only, provide an empty object.'
	);

	configureElementToolPrompt.parameter(
		'style',
		'A flat map of raw CSS declarations (property → value), e.g. { "line-height": "20px", "color": "red" }. OPTIONAL.'
	);

	configureElementToolPrompt.example( `
\`\`\`json
{
  propertiesToChange: {
    // List of properties TO CHANGE, following the PropType schema for the element as defined in the resource [${ WIDGET_SCHEMA_URI }]
    title: {
      $$type: 'string',
      value: 'New Title Text'
    },
    border: {
      $$type: 'boolean',
      value: false
    },
  },
  style: {
    'line-height': '20px',
    'color': 'red'
  },
  elementId: 'element-id',
  elementType: 'element-type'
};
\`\`\`
` );

	configureElementToolPrompt.instruction(
		'The $$type property is MANDATORY for every value; it is required to parse the value and apply application-level effects.'
	);

	configureElementToolPrompt.instruction( `
V4 only: If MCP fails, give manual steps using V4 UI.

V4 Editor structure:
Panel tabs: General (→ Settings section: ID, Tag, Link), Style, Interactions.
NO Advanced tab. Never mention Advanced tab.
` );

	return configureElementToolPrompt.prompt();
};

export const CONFIGURE_ELEMENT_GUIDE_TEXT = generatePrompt();
