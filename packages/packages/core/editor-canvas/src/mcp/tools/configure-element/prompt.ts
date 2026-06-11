import { toolPrompts } from '@elementor/editor-mcp';

import { DYNAMIC_TAGS_URI } from '../../resources/dynamic-tags-resource';
import { WIDGET_SCHEMA_URI } from '../../resources/widgets-schema-resource';

export const CONFIGURE_ELEMENT_GUIDE_URI = 'elementor://canvas/tools/configure-element-guide';

export const generatePrompt = () => {
	const configureElementToolPrompt = toolPrompts( 'configure-element' );

	configureElementToolPrompt.description( `
Configure an existing element on the page.

# **CRITICAL - REQUIRED INFORMATION (Must read before using this tool)**
1. [${ WIDGET_SCHEMA_URI }] — **Widget properties** (\`propertiesToChange\`): each widgetType (e.g. e-heading, e-button) has its own PropType schema; values must be PropValues with \`$$type\`.
2. [elementor://global-variables] — **Design tokens for styling**: use labels in CSS as \`var(--label)\` or \`var(--label, fallback)\`; only variables listed here are valid.
3. **Styling** (\`style\` parameter): flat map of CSS property → value strings — **not** PropValues. The server converts to native styles; unconvertible declarations become custom CSS.
4. **Current state**: \`get-element-configuration-values\` returns \`properties\` as PropValues and \`style\` in stored form; when writing, send raw CSS in \`style\`, not copied PropValues.

Before using this tool, read the widget PropType schema at editor-canvas__elementor://widgets/schema/{widgetType}

# When to use this tool
When a user requires to change anything in an element, such as updating text, colors, sizes, or other configurable properties.
This tool handles elements of type "widget".
This tool handles styling elements, using the "style" parameter (raw CSS as a property → value map).

To CLEAR a property (i.e., set it to default or none), provide null as a value - example: \`background-color: null\`.

The element's schema must be known before using this tool.

**PropValue structure (for \`propertiesToChange\` only — not for \`style\`):**
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
For styling, use the "style" parameter with raw CSS declarations (property → value strings) - e.g. \`color: var(--primary-text, #000); height: 4rem;\`;
For all non-primitive entries in \`propertiesToChange\`, provide the schema \`key\` as \`$$type\` in the generated object, as it is MANDATORY for parsing.

Use the EXACT PropType schema given, and ALWAYS include the \`key\` from the schema for every property you are changing in \`propertiesToChange\`.

Check \`llm_guidance.default_settings\` in the widget schema — include a key in \`propertiesToChange\` only when the user explicitly asks to change it.

# Dynamic tags
A value can be made dynamic wherever its schema exposes a variant with "$$type": "dynamic". This may be the property root OR a NESTED field: for example an image is made dynamic on its "src" (the root stays "image"), NOT on the whole "image" value.
Put the dynamic object EXACTLY at the node whose schema offers the "dynamic" variant, in place of the static variant. The variant's "name" enumerates the tags allowed at that node.
1. Read the [${ DYNAMIC_TAGS_URI }] resource for each allowed tag's settings schema.
2. Provide, at that node:
{
  "$$type": "dynamic",
  "value": {
    "name": "<allowed tag name>",
    "settings": { /* strictly per the tag's settings schema */ }
  }
}
Image example: { "$$type": "image", "value": { "src": { "$$type": "dynamic", "value": { "name": "<image tag>", "settings": { ... } } } } }
Do NOT send "group" (it is resolved automatically). Use { "settings": {} } only when the tag has no settings.
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
		'A flat map of raw CSS declarations (property → value), e.g. { "line-height": "1.25rem", "color": "var(--primary-text, #000)" }. Set a value to null to reset that property to its default. OPTIONAL.'
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
    'line-height': '1.25rem',
    'color': 'var(--primary-text, #000)'
  },
  elementId: 'element-id',
  elementType: 'element-type'
};
\`\`\`
` );

	configureElementToolPrompt.instruction(
		'The $$type property is MANDATORY for every value in propertiesToChange; it is not used in the style parameter (raw CSS only).'
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
