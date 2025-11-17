import { STYLE_SCHEMA_URI, WIDGET_SCHEMA_URI } from './resources/widgets-schema-resource';

export const mcpDescription = `Canvas MCP - Working with widgets and styles: how to use the PropType schemas and generate PropValue structures

# Elementor's PropValue configuration system

Every widget in Elementor has a set of properties that can be configured. These properties are defined using a strict schema, which specifies the type and structure of each property's value.
All values are wrapped in a special structure called a "PropValue", which includes data and additional information about the type of the value.

To correctly configure a widget's properties, you must follow the PropType schema defined for that widget. This schema outlines the expected structure and types for each property, ensuring that the values you provide are valid and can be properly interpreted by Elementor.
Every widget has it's own PropType schema, retreivable from the resource [${ WIDGET_SCHEMA_URI }].
ALL WIDGETS share a common _styles property with a uniform styles schema, retreivable from the resource [${ STYLE_SCHEMA_URI }].
The style schema is grouped by categories, such as "typography", "background", "border", etc.

All array types that can receive union types, are typed as mixed array, which means that each item in the array can be of any of the allowed types defined in the PropType schema.
Example: the "background" can have a background-overlay property, which can contain multiple overlays, such as color, gradient, image, etc. Each item in the array must follow the PropType schema for each overlay type.
All _style properties are OPTIONAL. When a _style is defined, we MERGE the values with existing styles, so only the properties you define will be changed, and the rest will remain as is.

When applicable for styles, use the "custom_css" property for free-form CSS styling. This property accepts a string of CSS rules that will be applied directly to the element.
The css string must follow standard CSS syntax, with properties and values separated by semicolons, no selectors, or nesting rules allowed.

Additionaly, some PropTypes have metadata information (meta property) that can help in understaind the PropType usage, such as description or other useful information.

# Note about null values
If a PropValue's value is null, omit the entire PropValue object.

Example of "image" PropValue structure:

PropValue structure:
{$$type:'image',value:{src:{$$type:'image-src',value:{url:{$$type:'url',value:'https://example.com/image.jpg'}}},size:{$$type:'string',value:'full'}}}

Example of 
`;
