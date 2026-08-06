import { WIDGET_SCHEMA_URI } from './resources/widgets-schema-resource';

const ELEMENT_SCHEMA_URI = WIDGET_SCHEMA_URI.replace( '{widgetType}', 'element-schema' );

export const mcpDescription = `Elementor Canvas MCP
This MCP enables configuration and styling of existing V4 elements on the Elementor canvas using the configure-element tool.

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

## Design System Tools
- **Global Variables**: Reusable colors, sizes, and fonts (\`list-global-variables\`)
- **Global Classes**: Reusable style sets that can be applied to elements (\`list-global-classes\`)
- **Widget Schemas**: Configuration options for each widget type (\`${ WIDGET_SCHEMA_URI }\`)

# Configuring Elements with configure-element

The \`configure-element\` tool updates settings and styles on existing V4 elements. Read the configure-element guide resource before use.

## Complete Workflow

### 1. Parse User Requirements
Understand what needs to change: content, settings, or styling on existing elements.

### 2. Check Global Design Tokens FIRST
Always check existing tokens before styling:
- Call \`list-global-variables\` for available variables (colors, sizes, fonts)
- Call \`list-global-classes\` for available style sets
- **Always prefer using existing global resources over creating inline styles**

### 3. Retrieve Widget Schemas
For each element you will configure:
- List \`${ WIDGET_SCHEMA_URI }\` to see available widgets
- Retrieve configuration schema from \`${ ELEMENT_SCHEMA_URI }\` for each widget
- Check the \`llm_guidance\` property for container nesting, \`default_styles\`, and \`default_settings\`

### 4. Get Current Element State
Use page structure and element configuration resources to find element IDs and current values.

### 5. Create propertiesToChange
Map property names to PropValues using the widget schema:
- Use correct \`$$type\` matching the widget's schema
- Use global variables in PropValues where applicable
- Example:
\`\`\`json
{
  "text": { "$$type": "string", "value": "Welcome" },
  "tag": { "$$type": "string", "value": "h1" }
}
\`\`\`

### 6. Create style
Provide raw CSS declarations (property → value strings). The server converts them to native styles and stores any unconvertible declarations as the element custom CSS.
- Example:
\`\`\`json
{
  "color": "#1a1a1a",
  "font-size": "2rem"
}
\`\`\`

### 7. Execute configure-element
Call the tool with elementId, elementType, propertiesToChange, and style as needed.

## Key Points

- **PropValue Types**: Arrays that accept union types are typed as mixed arrays
- **Visual Sizing**: Widget sizes MUST be defined via the style parameter (raw CSS). Widget properties like image "size" control resolution, not visual appearance
- **Global Variables**: Reference by label/name: (e.g. var(--card-background-color)
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
Note: The "size" property controls image resolution/loading, not visual size. Set visual dimensions via the style parameter (raw CSS).
`;
