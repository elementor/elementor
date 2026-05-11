import { toolPrompts } from '@elementor/editor-mcp';

import { STYLE_SCHEMA_URI, WIDGET_SCHEMA_URI } from '../../resources/widgets-schema-resource';

export const CONFIGURE_ELEMENT_GUIDE_URI = 'elementor://canvas/tools/configure-element-guide';

export const generatePrompt = () => {
	const configureElementToolPrompt = toolPrompts( 'configure-element' );

	configureElementToolPrompt.description( `
Configure an existing element on the page.

# **CRITICAL - REQUIRED INFORMATION (Must read before using this tool)**
1. [${ WIDGET_SCHEMA_URI }]
   Required to understand which widgets are available, and what are their configuration schemas.
   Every widgetType (i.e. e-heading, e-button) that is supported has it's own property schema, that you must follow in order to apply parameter values correctly.
2. [${ STYLE_SCHEMA_URI }]
   Required to understand the styles schema for the widgets. All widgets share the same styles schema, grouped by categories.
   Use this resource to understand which style properties are available for each element, and how to structure the "stylePropertiesToChange" parameter.
3. If not sure about the PropValues schema, you can use the "get-element-configuration-values" tool to retrieve the current PropValues configuration of the element.

Before using this tool, check the definitions of the elements PropTypes at the resource "widget-schema-by-type" at editor-canvas__elementor://widgets/schema/{widgetType}
All widgets share a common _style property for styling, which uses the common styles schema.
Retrieve and check the common styles schema at the resource list "styles-schema" at editor-canvas__elementor://styles/schema/{category}

# When to use this tool
When a user requires to change anything in an element, such as updating text, colors, sizes, or other configurable properties.
This tool handles elements of type "widget".
This tool handles styling elements, using the "stylePropertiesToChange" parameter.

To CLEAR a property (i.e., set it to default or none), provide null as a value.

The element's schema must be known before using this tool.
The style schema must be known before using this tool.

Attached resource link describing how PropType schema should be parsed as PropValue for this tool.

Read carefully the PropType Schema of the element and it's styles, then apply correct PropValue according to the schema.

PropValue structure:
{
    "$$type": string, // MANDATORY as defined in the PropType schema under the "key" property
    value: unknown // The value according to the PropType schema for kinds of "array", use array with PropValues items inside. For "object", read the shape property of the PropType schema. For "plain", use strings.
}

<IMPORTANT>
ALWAYS MAKE SURE you have the PropType schemas for the element you are configuring, and the common-styles schema for styling. If you are not sure, retrieve the schema from the resources mentioned above.
</IMPORTANT>

You can use multiple property changes at once by providing multiple entries in the propertiesToChange object, including _style alongside non-style props.
Some properties are nested, use the root property name, then objects with nested values inside, as the complete schema suggests.

Make sure you have the "widget-schema-by-type" resource available to retrieve the PropType schema for the element type you are configuring.
Make sure you have the "styles-schema" resources available to retrieve the common styles schema.

# How to configure elements
We use a dedicated PropType Schema for configuring elements, including styles. When you configure an element, you must use the EXACT PropType Value as defined in the schema.
For styleProperties, use the style schema provided, as it also uses the PropType format.
For all non-primitive types, provide the key property as defined in the schema as $$type in the generated object, as it is MANDATORY for parsing.

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
		'stylePropertiesToChange',
		'An object containing the style properties to change, with their new values. OPTIONAL.'
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
  stylePropertiesToChange: {
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
# When the operation cannot be completed via MCP
If a property is not in the widget schema (e.g. the tool returns an error or the property simply does not appear), do NOT fall back to V3 editor instructions. This is a V4 (Elementor Editor) element. The V4 editor UI is different from V3.

Tell the user how to do it manually in V4:

**V4 Editor panel structure (for manual steps):**
- Click the element on the canvas to select it
- The left panel updates to show that element's settings
- The panel has three tabs at the top: **General**, **Style**, **Interactions**
- Under the **General** tab, settings are grouped into collapsible sections (e.g. **Content**, **Settings**)
- Under the **Settings** section you'll find fields like **Tag**, **Link**, **ID**, **Attributes** and **Display Conditions**
- **Style** settings (colors, typography, spacing, custom CSS) are under the **Style** tab

**V4 does NOT have an "Advanced tab"** — equivalent settings are in the **Settings** section or **Style** tab.
Never tell a V4 user to go to an "Advanced tab".
` );

	return configureElementToolPrompt.prompt();
};

export const CONFIGURE_ELEMENT_GUIDE_TEXT = generatePrompt();
