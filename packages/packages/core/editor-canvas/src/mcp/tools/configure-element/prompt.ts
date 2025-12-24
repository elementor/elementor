import {
	STYLE_SCHEMA_URI,
	WIDGET_SCHEMA_URI,
} from '../../resources/widgets-schema-resource';

export const configureElementToolPrompt = `Configure an existing element on the page.

# **CRITICAL - REQUIRED INFORMATION (Must read before using this tool)**
1. [${ WIDGET_SCHEMA_URI }]
   Required to understand which widgets are available, and what are their configuration schemas.
   Every widgetType (i.e. e-heading, e-button) that is supported has it's own property schema, that you must follow in order to apply parameter values correctly.
2. [${ STYLE_SCHEMA_URI }]
   Required to understand the styles schema for the widgets. All widgets share the same styles schema, grouped by categories.
   Use this resource to understand which style properties are available for each element, and how to structure the "stylePropertiesToChange" parameter.
3. If not sure about the PropValues schema, you can use the "get-element-configuration-values" tool to retreive the current PropValues configuration of the element.

Before using this tool, check the definitions of the elements PropTypes at the resource "widget-schema-by-type" at editor-canvas__elementor://widgets/schema/{widgetType}
All widgets share a common _style property for styling, which uses the common styles schema.
Retreive and check the common styles schema at the resource list "styles-schema" at editor-canvas__elementor://styles/schema/{category}

# Parameters
- propertiesToChange: An object containing the properties to change, with their new values. MANDATORY. When updating a style only, provide an empty object.
- stylePropertiesToChange: An object containing the style properties to change, with their new values. OPTIONAL
- elementId: The ID of the element to configure. MANDATORY
- elementType: The type of the element to configure (i.e. e-heading, e-button). MANDATORY

# When to use this tool
When a user requires to change anything in an element, such as updating text, colors, sizes, or other configurable properties.
This tool handles elements of type "widget".
This tool handles styling elements, using the "stylePropertiesToChange" parameter.

# CRITICAL: Color Property Handling - MANDATORY WORKFLOW (ENFORCED - CANNOT BYPASS)
**ABSOLUTE REQUIREMENT**: For the "color" style property, you MUST ALWAYS call the "convert-css-to-atomic" tool FIRST before calling this tool. This is ENFORCED by validation - the tool will REJECT any color property that was not created by "convert-css-to-atomic".

**FORBIDDEN ACTIONS (WILL CAUSE ERRORS):**
- Using the style schema directly for color properties
- Passing raw CSS color strings (e.g., "red", "#ff0000") directly to this tool
- Manually constructing PropValue objects for color properties (even if format is correct)
- Extracting color PropValues from style schema resources
- Copying PropValue structure from examples or documentation

**MANDATORY WORKFLOW FOR COLOR PROPERTIES (NO EXCEPTIONS - FOLLOW EXACTLY):**
1. **STEP 1 (REQUIRED)**: Call "convert-css-to-atomic" tool with: { "cssString": "color: YOUR_COLOR;" }
   Example: { "cssString": "color: red;" } or { "cssString": "color: #ff0000;" }
2. **STEP 2**: Extract the PropValue from the response: result.props.color
   This object will have: { "$$type": "color", "value": "#ff0000", "_convertedBy": "convert-css-to-atomic" }
3. **STEP 3**: Use that EXACT object (do not modify it) in "stylePropertiesToChange.color"
   Example: stylePropertiesToChange: { color: result.props.color }
4. **STEP 4**: For all other style properties (not color), use the style schema as normal

**ENFORCEMENT MECHANISM**: 
This tool validates that color PropValues contain a special "_convertedBy" marker that is ONLY added by "convert-css-to-atomic". If this marker is missing, the tool will REJECT the request with a detailed error message showing exactly what to do, even if the PropValue format is otherwise correct. This ensures you cannot bypass the converter tool.

**WHY THIS IS REQUIRED**:
- Ensures consistent color conversion across all CSS formats
- Validates color values properly
- Maintains compatibility with future color format changes
- Provides proper error handling for invalid colors

**IF YOU GET AN ERROR**: The error message will include a step-by-step example. Follow it exactly. Do not try to work around it.

To CLEAR a property (i.e., set it to default or none), provide null as a value.

The element's schema must be known before using this tool.
The style schema must be known before using this tool (except for color, which uses the CSS converter).

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

Make sure you have the "widget-schema-by-type" resource available to retreive the PropType schema for the element type you are configuring.
Make sure you have to "styles-schema" resources available to retreive the common styles schema.

# How to configure elements
We use a dedicated PropType Schema for configuring elements, including styles. When you configure an element, you must use the EXACT PropType Value as defined in the schema.
For styleProperties, use the style schema provided, as it also uses the PropType format.
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
  },
  stylePropertiesToChange: {
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
  },
  elementId: 'element-id',
  elementType: 'element-type'
};
\`\`\`

<IMPORTANT>
The $$type property is MANDATORY for every value, it is required to parse the value and apply application-level effects.
</IMPORTANT>
`;
