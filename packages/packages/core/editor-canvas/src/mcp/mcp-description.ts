import { STYLE_SCHEMA_URI, WIDGET_SCHEMA_URI } from './resources/widgets-schema-resource';

const ELEMENT_SCHEMA_URI = WIDGET_SCHEMA_URI.replace( '{widgetType}', 'element-schema' );

export const mcpDescription = `Canvas MCP
This MCP enables everything related to creation, configuration, and styling of elements on the Elementor canvas.

# Design Systems in Elementor
- Elementor presents global classes. Each global class is a a set of styles that can be applied to multiple elements. This allows for consistent styling across the design.
- Elementor also presents global variables, which can be colors, sizes or fonts. These variables can be used in any element's styles, or global classes, allowing for easy updates and consistency across the design.
- All data is stored in a PropValue structure, which is a wrapper for elementor values. The PropValues are derived from an internal "PropType" schema, which defines the structure and types of the values.

# PropValues structure and usage
\`\`\`json
{
  $$type: 'the-prop-type-schema-kind',
  value: 'the-actual-value-as-defined-for-the-propType'
}
\`\`\`
The "value" property can be an object, string, number, boolean, array, etc. The $$type defines the kind of value, and the value is the actual value.
It is critical to provide the correct $$type for each value, as it defines how Elementor will interpret the value or reject it.

All widgets properties and configuration is built from sets of PropValues, which can be retreived from the resource [${ WIDGET_SCHEMA_URI }].
All styles are SHARED ACCROSS widgets, containers and components, and are defined in a common styles schema, retreivable from the resource [${ STYLE_SCHEMA_URI }].
The style schema also defines the global classes.

To understand the configuration options for an element, refer to the PropType schema for that specific element. For example: "e-heading" configuration schema is available at the resource [${ WIDGET_SCHEMA_URI }/e-heading]

# Modifying elements and styles
When configuring an element, elementor does a MERGE PROPERTIES operation, which means that only the properties you provide will be updated, and the rest will remain as is.
For deleting a property, the value must be set to null, instead of a PropValue. When adding a configuration, no need to provide the full configuration, only the properties you want to add or update.
The same rule applies to styles as well and modifications to global classes.

# Building full compositions
The "build-composition" tool allows creating multiple elements in a single operation.
The tool accepts both the structure, the styling and the configuration of each element to be created.

- First step: Retreive the available widgets by listing the [${ WIDGET_SCHEMA_URI }] dynamic resource.
- Second step: decide which elements to create, and their configuration and styles.
  Retrieve the used elements configuration schema from the resource [${ ELEMENT_SCHEMA_URI }]
- Third step: define the styles for each element, using the common styles schema from the resource [${ STYLE_SCHEMA_URI }]. List the resource to see all available style properties.

## Workflow for build-compositions tool
1. **Parse user requirements** - Undestand what needs to be built (structure, content, styling).
2. ** Check global resources FIRST** - Always check before building:
   - List \`elementor://global-classes\` to see if the needed global classes already exist.
   - List \`elementor://global-variables\` to see if the needed global variables already exist.
   - **Preference**: Use existing global classes and variables over creating new inline styles.
3. **Retreive widget schemas** - For each widget you will use:
   - List [${ WIDGET_SCHEMA_URI }] to see available widgets.
   - Retrieve configuration schema from [${ ELEMENT_SCHEMA_URI }] for each widget to understand required properties.
   - Understand if a widget is a container (can have children) by checking the "llm_guidance" property in the widget's schema.
4. **Build XML structure** - Create valid XML width configuration-ids:
   - Every element has unique configuration-id attribute
   - No text nodes, classes, IDs in XML.
   
5. **Create elementConfig** - For each configuration-id:
   - Use PropValues with corrent \`$$type\` matching the schema.
   - **Use global variables** in PropValues where applicable

6. **Create stylesConfig** - For each configuration-id:
   - Use style schema PropValues from [${ STYLE_SCHEMA_URI }]
   - **Use global variables** for colors, sizes, fonts where applicable
   - **Important**: Global classes are applied AFTER building the composition. Once built, apply classes using the "apply-global-class" tool - after completion of building the composition.

7. **Validate** - Ensure:
   - XML structure is valid
   - All PropValues have corrent \`$$type\`
   - After building a composition, you can retreive each element configuration using the "get-element-configuration-values" tool to verify correctness, using the IDs returned from the build-composition tool.

## Key relationships:
- **XML structure**: Defines the hierarchy of elements/widgets
- **elementConfig**: Maps configuration-id to widget PropValues
- **stylesConfig**: Maps configuration-id to style PropValues

## Using global variables example:
Existing global variables can be used during composition
\`\`\`json
{ "color": { "$$type": "global-color-variable", "value": "global-variable-id" } }
\`\`\`

# Configuring Elements / Adding Style to Elements
An element configuration can be retrieved using the "get-element-configuration-values" tool.
Updating an element requires only the UPDATED properties (including in the styles), as Elementor does a MERGE/PATCH operation.

<note>
for PropValue with array as value:
All array types that can receive union types, are typed as mixed array.
</note>

# Styling best practices
Prefer using "em" and "rem" values for text-related sizes, padding and spacing. Use percentages for dynamic sizing relative to parent containers.
This flexboxes are by default "flex" with "stretch" alignment. To ensure proper layout, define the "justify-content" and "align-items" as in the schema.

# Examples:

## e-image PropValue structure:
{$$type:'image',value:{src:{$$type:'image-src',value:{url:{$$type:'url',value:'https://example.com/image.jpg'}}},size:{$$type:'string',value:'full'}}}

Widgets' sizes MUST be defined using the style schema. Images, for example, have a "size" property, but it DOES NOT AFFECT THE VISUAL size, but rather the image size/resolution to load.

# Working with Global Classes and Variables
- To get the list of available global classes, use the resource at uri elementor://global-classes
- To get the list of available global variables, use the resource at uri elementor://global-variables
- Before creating a global variable or class, refer to the list and see if it already exists.
- Naming conventions:
  - Global classes and global variables should have meaningful names that reflect their purpose and usage.
  - Avoid generic names like "style1" or "classA"; instead, use descriptive names like "primary-button" or "heading-level-1".
  - Avoid names that reflect colors or values, use only purpose-based names.

# Advanced operations
You are encouraged to run multiple times multiple tools to achieve the desired result.

An Example scenario of creating fully styled composition:
1. Get the list of availble widgets using dynamic resource [${ WIDGET_SCHEMA_URI }]
2. For each element to create, retreive its configuration schema from [${ WIDGET_SCHEMA_URI }/element-name]
3. Get the list of available global classes using the always up-to-date resource 
4. Get the list of available global variables using the dynamic resource
5. Build a composition using the "build-composition" tool, providing the structure, configuration and styles for each element. You may want to style the elements later.
6. Check you work: as you have the created IDs from the build-composition response, you can retreive each element configuration using the "get-element-configuration-values" tool.
7. If needed, update styles using the "configure-element" tool, providing only the styles or widget's properties to update.
`;
