import { STYLE_SCHEMA_URI, WIDGET_SCHEMA_URI } from './resources/widgets-schema-resource';

export const mcpDescription = `Canvas MCP - Working with widgets and styles: how to use the PropType schemas and generate PropValue structures

# Elementor's PropValue configuration system

Every widget in Elementor has a set of properties that can be configured, defined in a STRICT SCHEMA we call "PropType".
All widget configuration values are represented using a structure we call "PropValue".

To correctly configure a widget's properties, FOLLOW THE PropType schema defined for that widget. This schema outlines the expected structure and types for each property, ensuring that the values you provide are valid and can be properly interpreted by Elementor.
Every widget has it's own PropType schema, retreivable from the resource [${ WIDGET_SCHEMA_URI }].
ALL WIDGETS share a common _styles property with a uniform styles schema, retreivable from the resource [${ STYLE_SCHEMA_URI }].
The style schema is grouped by categories, such as "typography", "background", "border", etc.

# Tools and usage
- Use the "get-element-configuration-values" tool to retrieve the current configuration of a specific element, including its PropValues and styles. It is recommended to use this tool when you are required to make changes to an existing element, to ensure you have the correct current configuration schema.
  If a PropValue changes it's type (only on union PropTypes), read the new schema from the resources mentioned above, and adjust the PropValue structure accordingly.
- Use the "build-composition" tool to create a NEW ELEMENTS in a composition on the page. You can use this tool to also create a new single element.
- Use the "configure-element" tool to update the configuration of an EXISTING element on the page.

All array types that can receive union types, are typed as mixed array, which means that each item in the array can be of any of the allowed types defined in the PropType schema.
Example: the "background" can have a background-overlay property, which can contain multiple overlays, such as color, gradient, image, etc. Each item in the array must follow the PropType schema for each overlay type.
All _style properties are OPTIONAL. When a _style is defined, we MERGE the values with existing styles, so only the properties you define will be changed, and the rest will remain as is.

# Styling best practices
Prefer using "em" and "rem" values for text-related sizes, padding and spacing. Use percentages for dynamic sizing relative to parent containers.
This flexboxes are by default "flex" with "stretch" alignment. To ensure proper layout, define the "justify-content" and "align-items" as in the schema.

Additionaly, some PropTypes have metadata information (meta property) that can help in understaind the PropType usage, such as description or other useful information.

Example of null values:
{
  $$type: 'as-defined-for-propValue',
  value: null
}

Example of "image" PropValue structure:
{$$type:'image',value:{src:{$$type:'image-src',value:{url:{$$type:'url',value:'https://example.com/image.jpg'}}},size:{$$type:'string',value:'full'}}}

`;
