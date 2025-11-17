import { toolPrompts } from '@elementor/editor-mcp';

import { STYLE_SCHEMA_URI, WIDGET_SCHEMA_URI } from '../../resources/widgets-schema-resource';

const CUSTOM_CSS_URI = STYLE_SCHEMA_URI.replace( '{category}', 'custom_css' );

export const generatePrompt = () => {
	const buildCompositionsToolPrompt = toolPrompts( 'build-compositions' );

	buildCompositionsToolPrompt.description( `
Build entire elementor widget comositions representing complex structures of nested elements.

# When to use this tool
Always prefer this tool when the user requires to build a composition of elements, such as cards, heros, or inspired from other pages or HTML compositions.
Prefer this tool over any other tool for building HTML structure, unless you are specified to use a different tool.

# **CRITICAL - REQUIRED RESOURCES (Must read before using this tool)**
1. [${ WIDGET_SCHEMA_URI }]
   Required to understand which widgets are available, and what are their configuration schemas.
   Every widgetType (i.e. e-heading, e-button) that is supported has it's own property schema, that you must follow in order to apply property values correctly.
2. [${ CUSTOM_CSS_URI }]
   Required to understand the styles schema for the widgets. All widgets share the same styles schema.
   USE ONLY THE "custom_css" CATEGORY FROM THE STYLES SCHEMA FOR STYLING THE ELEMENTS with this tool.
3. List of allowed custom tags for building the structure is derived from the list of widgets schema resources.

# Instructions
1. Understand the user requirements carefully.
2. Build a valid XML structure using only the allowed custom tags provided. For example, if you
   use the "e-button" element, it would be represented as <e-button></e-button> in the XML structure.
3. Plan the configuration for each element according to the user requirements, using the configuration schema provided for each custom tag.
   Every widget type has it's own configuration schema, retreivable from the resource [${ WIDGET_SCHEMA_URI }].
   PropValues must follow the exact PropType schema provided in the resource.
4. For every element, provide a "configuration-id" attribute. For example:
   \`<e-flexbox configuration-id="flex1"><e-heading configuration-id="heading2"></e-heading></e-flexbox>\`
   In the elementConfig property, provide the actual configuration object for each configuration-id used in the XML structure.
   In the stylesConfig property, provide the actual styles configuration object for each configuration-id used in the XML structure.
   For easy execution, USE ONLY "custom_css" category from the styles schema resource to apply styles.
5. Ensure the XML structure is valid and parsable.
6. Do not add any attribute nodes, classes, id's, and no text nodes allowed, for inline styles prefer USE the [${ CUSTOM_CSS_URI }] resource for custom_css.
7. Some elements allow nesting of other elements, and most of the DO NOT. The allowed elements that can have nested children are "e-div-block" and "e-flexbox".
8. Make sure that non-container elements do NOT have any nested elements.
9. Unsless the user specifically requires structure only, BE EXPRESSIVE AND VISUALLY CREATIVE AS POSSIBLE IN APPLYING STYLE CONFIGURATION.
   In the case of doubt, prefer adding more styles to make the composition visually appealing.

# Additional Guidelines
- Most users expect the structure to be well designed and visually appealing.
- Use layout properties, ensure "white space" design approach is followed, and make sure the composition is visually balanced.
- Use appropriate spacing, alignment, and sizing to create a harmonious layout.
- Consider the visual hierarchy of elements to guide the user's attention effectively.
- You are encouraged to use colors, typography, and other style properties to enhance the visual appeal, as long as they are part of the configuration schema for the elements used.
- Always aim for a clean and professional look that aligns with modern design principles.
- When you are required to create placeholder texts, use texts that have a length that fits the goal. When long texts are required, use longer placeholder texts. When the user specifies exact texts, use the exact texts.
- Image size does not affect the actual size on the screen, only which quality to use. If you use images, specifically add _styles PropValues to define the image sizes.

# CONSTRAINTS
When a tool execution fails, retry up to 10 more times, read the error message carefully, and adjust the XML structure or the configurations accordingly.
If a "$$type" is missing, update the invalid object, if the XML has parsing errors, fix it, etc. and RETRY.
VALIDATE the XML structure before delivering it as the final result.
VALIDATE the JSON structure used in the "configuration" attributes for each element before delivering the final result. The configuration must MATCH the PropValue schemas.
NO LINKS ALLOWED. Never apply links to elements, even if they appear in the PropType schema.
elementConfig values must align with the widget's PropType schema, available at the resource [${ WIDGET_SCHEMA_URI }].
stylesConfig values must align with the common styles PropType schema, available at the resource [${ STYLE_SCHEMA_URI }].

# Parameters
All parameters are MANDATORY.
- xmlStructure
- elementConfig
- stylesConfig

If unsure about the configuration of a specific property, read the schema resources carefully.


  ` );

	buildCompositionsToolPrompt.example( `
A Heading and a button inside a flexbox
{
  xmlStructure: "<e-flexbox configuration-id="flex1"><e-heading configuration-id="heading1"></e-heading><e-button configuration-id="button1"></e-button></e-flexbox>"
  elementConfig: {
    "flex1": {
      "tag": {
        "$$type": "string",
        "value": "section"
      },
  },
  styleConfig: {
    "heading1": {
      "custom_css": "font-size: 24px; color: #333;"
    }
  },
}
` );

	buildCompositionsToolPrompt.parameter(
		'xmlStructure',
		`**MANDATORY** A valid XML structure representing the composition to be built, using custom elementor tags, styling and configuration PropValues.`
	);

	buildCompositionsToolPrompt.parameter(
		'elementConfig',
		`**MANDATORY** A record mapping configuration IDs to their corresponding configuration objects, defining the PropValues for each element created.`
	);

	buildCompositionsToolPrompt.parameter(
		'styleConfig',
		`**MANDATORY** A record mapping style PropTypes to their corresponding style configuration objects, defining the PropValues for styles to be applied to elements.`
	);

	buildCompositionsToolPrompt.instruction(
		`You will be provided the XML structure with element IDs. These IDs represent the actual elementor widgets created on the page/post.
You should use these IDs as reference for further configuration, styling or changing elements later on.`
	);

	buildCompositionsToolPrompt.instruction(
		`If you have global styles/classes available in the project, you should prefer using them over inline styles, and you are welcome to execute relevant tools AFTER this tool execution, to apply global classes to the created elements.`
	);

	return buildCompositionsToolPrompt.prompt();
};
