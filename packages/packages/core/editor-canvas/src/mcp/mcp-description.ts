import { STYLE_SCHEMA_URI, WIDGET_SCHEMA_URI } from './resources/widgets-schema-resource';

const ELEMENT_SCHEMA_URI = WIDGET_SCHEMA_URI.replace( '{widgetType}', 'element-schema' );

export const mcpDescription = `Elementor Canvas MCP
This MCP enables creation, configuration, and styling of elements on the Elementor canvas using the build_composition tool.

# Core Concepts

## PropValues Structure
All data in Elementor uses PropValues - a typed wrapper for values:
\`\`\`json
{
  "$$type": "the-prop-type-schema-kind",
  "value": "the-actual-value-as-defined-for-the-propType"
}
\`\`\`
The \`$$type\` defines how Elementor interprets the value. Providing the correct \`$$type\` is critical - incorrect types will be rejected.

## Design System Resources
- **Global Variables**: Reusable colors, sizes, and fonts (\`elementor://global-variables\`)
- **Global Classes**: Reusable style sets that can be applied to elements (\`elementor://global-classes\`)
- **Widget Schemas**: Configuration options for each widget type (\`${ WIDGET_SCHEMA_URI }\`)
- **Style Schema**: Common styles shared across all widgets and containers (\`${ STYLE_SCHEMA_URI }\`)

# Building Compositions with build_composition

The \`build_composition\` tool is the primary way to create elements. It accepts structure (XML), configuration, and styling in a single operation.

## Complete Workflow

### 1. Parse User Requirements
Understand what needs to be built: structure, content, and styling.

### 2. Check Global Resources FIRST
Always check existing resources before building:
- List \`elementor://global-variables\` for available variables (colors, sizes, fonts)
- List \`elementor://global-classes\` for available style sets
- **Always prefer using existing global resources over creating inline styles**

### 3. Retrieve Widget Schemas
For each widget you'll use:
- List \`${ WIDGET_SCHEMA_URI }\` to see available widgets
- Retrieve configuration schema from \`${ ELEMENT_SCHEMA_URI }\` for each widget
- Check the \`llm_guidance\` property to understand if a widget is a container (can have children)

### 4. Build XML Structure
Create valid XML with configuration-ids:
- Each element must have a unique \`configuration-id\` attribute
- No text nodes, classes, or IDs in XML - structure only
- Example:
\`\`\`xml
<e-container configuration-id="container-1">
  <e-heading configuration-id="heading-1" />
  <e-text configuration-id="text-1" />
</e-container>
\`\`\`

### 5. Create elementConfig
Map each configuration-id to its widget properties using PropValues:
- Use correct \`$$type\` matching the widget's schema
- Use global variables in PropValues where applicable
- Example:
\`\`\`json
{
  "heading-1": {
    "text": { "$$type": "string", "value": "Welcome" },
    "tag": { "$$type": "string", "value": "h1" }
  }
}
\`\`\`

### 6. Create stylesConfig
Map each configuration-id to style PropValues from \`${ STYLE_SCHEMA_URI }\`:
- Use global variables for colors, sizes, and fonts
- Example using global variable:
\`\`\`json
{
  "heading-1": {
    "color": { "$$type": "global-color-variable", "value": "primary-color-id" },
    "font-size": { "$$type": "size", "value": "2rem" }
  }
}
\`\`\`

### 7. Execute build_composition
Call the tool with your XML structure, elementConfig, and stylesConfig. The response will contain the created element IDs.
At the response you will also find llm_instructions for you to do afterwards, read and follow them!

## Key Points

- **PropValue Types**: Arrays that accept union types are typed as mixed arrays
- **Visual Sizing**: Widget sizes MUST be defined in stylesConfig. Widget properties like image "size" control resolution, not visual appearance
- **Global Variables**: Reference by ID in PropValues (e.g., \`{ "$$type": "global-color-variable", "value": "variable-id" }\`)
- **Naming Conventions**: Use meaningful, purpose-based names (e.g., "primary-button", "heading-large"), not value-based names (e.g., "blue-style", "20px-padding")

## Example: e-image PropValue Structure
\`\`\`json
{
  "$$type": "image",
  "value": {
    "src": {
      "$$type": "image-src",
      "value": {
        "url": { "$$type": "url", "value": "https://example.com/image.jpg" }
      }
    },
    "size": { "$$type": "string", "value": "full" }
  }
}
\`\`\`
Note: The "size" property controls image resolution/loading, not visual size. Set visual dimensions in stylesConfig.
`;
