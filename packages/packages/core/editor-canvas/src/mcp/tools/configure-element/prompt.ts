import { STYLE_SCHEMA_URI, WIDGET_SCHEMA_URI } from '../../resources/widgets-schema-resource';

export const configureElementToolPrompt = `Configure an existing element on the page.

# **CRITICAL - REQUIRED INFORMATION (Must read before using this tool)**
1. [${ WIDGET_SCHEMA_URI }]
   Required to understand which widgets are available, and what are their configuration schemas.
   Every widgetType (i.e. e-heading, e-button) that is supported has it's own property schema, that you must follow in order to apply property values correctly.
2. [${ STYLE_SCHEMA_URI }]
   Required to understand the styles schema for the widgets. All widgets share the same styles schema, grouped by categories.
   Use this resource to understand which style properties are available for each element, and how to structure the "_styles" configuration property.
3. If not sure about the PropValues schema, you can use the "get-element-configuration-values" tool to retreive the current PropValues configuration of the element.

Before using this tool, check the definitions of the elements PropTypes at the resource "widget-schema-by-type" at editor-canvas__elementor://widgets/schema/{widgetType}
All widgets share a common _style property for styling, which uses the common styles schema.
Retreive and check the common styles schema at the resource list "styles-schema" at editor-canvas__elementor://styles/schema/{category}

Attempt to use the _style property "custom_css" for any styling that have complicated schemas (such as backgrounds), read the resource editor-canvas__elementor://styles/schema/custom_css for more information.

# Parameters
- propertiesToChange: An object containing the properties to change, with their new values. MANDATORY
- elementId: The ID of the element to configure. MANDATORY
- elementType: The type of the element to configure (i.e. e-heading, e-button). MANDATORY

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
    // List of properties TO CHANGE, following the PropType schema for the element as defined in the resource [${ WIDGET_SCHEMA_URI }]
    title: {
      $$type: 'string',
      value: 'New Title Text'
    },
    border: {
      $$type: 'boolean',
      value: false
    },
    _styles: {
      // List of available keys available at the [${ STYLE_SCHEMA_URI }] dynamic resource
      'line-height': {
        $$type: 'size', // MANDATORY do not forget to include the correct $$type for every property
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
`;
