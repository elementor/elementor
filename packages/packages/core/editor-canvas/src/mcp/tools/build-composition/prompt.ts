import { toolPrompts } from '@elementor/editor-mcp';

import { STYLE_SCHEMA_URI, WIDGET_SCHEMA_URI } from '../../resources/widgets-schema-resource';

export const generatePrompt = () => {
	const buildCompositionsToolPrompt = toolPrompts( 'build-compositions' );

	buildCompositionsToolPrompt.description( `
# **CRITICAL - REQUIRED RESOURCES (Must read before using this tool)**
1. [${ WIDGET_SCHEMA_URI }]
   Required to understand which widgets are available, and what are their configuration schemas.
   Every widgetType (i.e. e-heading, e-button) that is supported has it's own property schema, that you must follow in order to apply property values correctly.
2. [${ STYLE_SCHEMA_URI }]
   Required to understand the styles schema for the widgets. All widgets share the same styles schema.
3. List of allowed custom tags for building the structure is derived from the list of widgets schema resources.

# When to use this tool
Always prefer this tool when the user requires to build a composition of elements, such as cards, heros, or inspired from other pages or HTML compositions.
Prefer this tool over any other tool for building HTML structure, unless you are specified to use a different tool.

# **CRITICAL - REQUIRED RESOURCES (Must read before using this tool)**
1. [${ WIDGET_SCHEMA_URI }]
   Required to understand which widgets are available, and what are their configuration schemas.
   Every widgetType (i.e. e-heading, e-button) that is supported has it's own property schema, that you must follow in order to apply property values correctly.
2. [${ STYLE_SCHEMA_URI }]
   Required to understand the styles schema for the widgets. All widgets share the same styles schema.
3. List of allowed custom tags for building the structure is derived from the list of widgets schema resources.

# DESIGN QUALITY IMPERATIVE
You are generating designs for real users who expect distinctive, intentional aesthetics - NOT generic AI output.
**The Core Challenge**: Large language models naturally converge toward statistically common design patterns during generation. This creates predictable, uninspired results that users describe as "AI slop": safe color schemes, default typography hierarchies, minimal contrast, and timid spacing.
**Your Mission**: Actively resist distributional convergence by making intentional, distinctive design choices across all aesthetic dimensions. Every design decision should have a clear purpose tied to visual hierarchy, brand personality, or user experience goals.
When in doubt between "safe" and "distinctive," choose distinctive - users can always request refinements, but they cannot salvage generic foundations.

# When to use this tool
Always prefer this tool when the user requires to build a composition of elements, such as cards, heros, or inspired from other pages or HTML compositions.
Prefer this tool over any other tool for building HTML structure, unless you are specified to use a different tool.

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
5. Ensure the XML structure is valid and parsable.
6. Do not add any attribute nodes, classes, id's, and no text nodes allowed.
   Layout properties, such as margin, padding, align, etc. must be applied using the [${ STYLE_SCHEMA_URI }] PropValues.
7. Some elements allow nesting of other elements, and most of the DO NOT. The allowed elements that can have nested children are "e-tabs", "e-div-block", and "e-flexbox".
8. Make sure that non-container elements do NOT have any nested elements.
9. **CRITICAL - CUSTOM CSS USAGE**: ALWAYS Prefer using style schema. Custom CSS is ONLY FOR UNSUPPRTED schema styles.
   ALWAYS PRIORITIZE using the style schema PropValues for styling elements as they provide better user experience in the editor, and UI features for the end-users.
   Use custom_css only for style attributes that ARE NOT SUPPORTED via the style schema AFTER YOU CHECK THE [${ STYLE_SCHEMA_URI }].

1. **Parse user requirements** - Understand what the user wants to build, including structure, content, and styling preferences.

2. **Check available global classes and variables** - BEFORE building, list these resources:
   - \`elementor://global-classes\` - Check for existing global classes that can be applied
   - \`elementor://global-variables\` - Check for existing global variables (colors, sizes, fonts) that can be used in PropValues
   - **PREFERENCE**: Use existing global classes and variables over creating new inline styles

3. **Identify required widgets/elements** - Determine which Elementor widgets are needed (e-heading, e-button, e-flexbox, etc.)

4. **Retrieve schemas for each widget** - For each widget type you'll use:
   - Get configuration schema from [${ WIDGET_SCHEMA_URI }/widget-name]
   - Understand the PropValue structure required for each property

5. **Build XML structure with configuration-ids** - Create valid XML using only allowed custom tags:
   - Only "e-div-block" and "e-flexbox" can nest other elements
   - Every element must have a unique "configuration-id" attribute
   - Example: \`<e-flexbox configuration-id="flex1"><e-heading configuration-id="heading1"></e-heading></e-flexbox>\`
   - No text nodes, no classes, no IDs, no other attributes allowed

6. **Create elementConfig with proper PropValues** - For each configuration-id:
   - Use PropValues with correct \`$$type\` matching the widget's PropType schema
   - **Use global variables** where applicable (reference format: \`{$$type: "variable", value: {$$type: "string", value: "variable-name"}}\`)
   - Ensure all PropValues match the schema exactly

7. **Create stylesConfig with proper PropValues** - For each configuration-id:
   - **CRITICAL**: Use style schema PropValues from [${ STYLE_SCHEMA_URI }] for ALL supported properties
   - **MANDATORY style schema properties** (DO NOT use custom_css for these):
     - Layout: display, flex-direction, align-items, justify-content, gap
     - Spacing: padding, margin
     - Sizing: width, height, max-width, min-width
     - Typography: font-size, font-weight, line-height, letter-spacing, color, text-align
     - Visual: border-radius, box-shadow, background (for simple backgrounds)
   - **Use global variables** for colors, sizes, fonts where available
   - **custom_css (PRO ONLY)**: Only available for Elementor PRO users. If you are not PRO, this property will not be available in the style schema and will be rejected during validation.
     - If PRO: custom_css is ONLY for:
       - Complex multi-layer gradients that cannot be expressed via background PropValue
       - CSS features NOT yet available in the style schema
       - Advanced animations/transitions not in schema
   - **Note**: Global classes are applied AFTER building using the "apply-global-class" tool, not during build-composition

8. **Validate before submission**:
   - XML structure is valid and parsable
   - All PropValues have correct \`$$type\` matching schemas
   - All configuration-ids in XML have corresponding entries in elementConfig and stylesConfig
   - No nested elements in non-container widgets
   - Schema validation passes

# TECHNICAL REQUIREMENTS

## PropValue Format (CRITICAL)
Every property value MUST use the PropValue format with \`$$type\`:
\`\`\`
{
  "$$type": "prop-type-name",
  "value": <actual-value-as-defined-in-schema>
}
\`\`\`
The \`$$type\` must match exactly what's defined in the PropType schema. Missing or incorrect \`$$type\` will cause validation failures.

## XML Structure Rules
- Only "e-div-block" and "e-flexbox" can contain nested children
- All other widgets (e-heading, e-button, e-text, etc.) CANNOT have nested elements
- Every element must have a unique "configuration-id" attribute
- No text nodes, classes, IDs, or other attributes allowed
- Layout properties (margin, padding, align, etc.) must use style schema PropValues, not XML attributes

## Schema Validation
- elementConfig values must align with the widget's PropType schema from [${ WIDGET_SCHEMA_URI }]
- stylesConfig values must align with the common styles PropType schema from [${ STYLE_SCHEMA_URI }]
- When unsure about a property, retrieve and read the schema resource carefully

## Using Global Variables in PropValues
Global variables can be referenced directly in PropValues during build-composition:
\`\`\`
{
  "color": {
    "$$type": "variable",
    "value": {
      "$$type": "string",
      "value": "primary-color"
    }
  }
}
\`\`\`
Always check \`elementor://global-variables\` before building to see what's available.

## Global Classes vs Inline Styles
- **Global Classes**: Applied AFTER building using the "apply-global-class" tool. Check \`elementor://global-classes\` before building to see what's available.
- **Inline Styles**: Use style schema PropValues in stylesConfig during build-composition
- **Preference**: Use existing global classes/variables over creating new inline styles

# COMMON MISTAKES TO AVOID
1. **Missing \`$$type\`** - Every PropValue must have a \`$$type\` field matching the schema
2. **Nesting in non-containers** - Only e-div-block and e-flexbox can have children
3. **Invalid XML** - Ensure XML is well-formed and parsable
4. **Schema mismatch** - PropValues must match the exact PropType schema
5. **Missing configuration-ids** - Every element in XML must have a configuration-id with corresponding config objects
6. **Using custom_css for supported styles** - **CRITICAL ERROR**: Do NOT use custom_css for properties available in style schema:
   - ❌ WRONG: \`custom_css: "display: flex; flex-direction: column; padding: 2rem;"\`
   - ✅ CORRECT: Use \`display\`, \`flex-direction\`, and \`padding\` PropValues from style schema
   - ❌ WRONG: \`custom_css: "border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.08);"\`
   - ✅ CORRECT: Use \`border-radius\` and \`box-shadow\` PropValues from style schema
   - ❌ WRONG: \`custom_css: "gap: 2rem; width: 100%;"\`
   - ✅ CORRECT: Use \`gap\` and \`width\` PropValues from style schema
7. **Not checking global resources** - Always check global classes and variables before building

# VALIDATION CHECKLIST
Before submitting, verify:
- [ ] XML structure is valid and parsable
- [ ] All PropValues have correct \`$$type\` matching schemas
- [ ] All configuration-ids in XML have entries in elementConfig
- [ ] All configuration-ids in XML have entries in stylesConfig
- [ ] No nested elements in non-container widgets
- [ ] Schema validation passes for all PropValues
- [ ] Global variables/classes checked and used where applicable
- [ ] **NO custom_css used for**: display, flex-direction, align-items, justify-content, gap, padding, margin, width, height, border-radius, box-shadow, font-size, font-weight, line-height, color, text-align
- [ ] **If PRO user**: custom_css ONLY used for complex multi-layer gradients, unsupported CSS features, advanced animations
- [ ] **If non-PRO user**: custom_css is not available - use style schema PropValues for all styling

# ERROR HANDLING & RETRY STRATEGY
When a tool execution fails, retry up to 10 more times. Read the error message carefully and adjust accordingly:
- If \`$$type\` is missing: Add the correct \`$$type\` matching the schema
- If XML has parsing errors: Fix the XML structure
- If schema validation fails: Check PropValues match the exact PropType schema
- If configuration-id mismatch: Ensure all IDs in XML have corresponding config objects
- **ALWAYS RETRY** after fixing errors - do not give up after first failure

# CONSTRAINTS
- NO LINKS ALLOWED. Never apply links to elements, even if they appear in the PropType schema.
- All parameters (xmlStructure, elementConfig, stylesConfig) are MANDATORY.
- If unsure about a property configuration, read the schema resources carefully.

# DESIGN QUALITY GUIDANCE
While functional correctness is primary, aim for distinctive, intentional design choices rather than generic defaults:

**Avoid Generic Patterns:**
- Generic sans-serifs (Inter, Roboto, Arial) as primary typefaces
- Timid size ratios (1.2x, 1.5x) - use 3x+ for headlines vs body
- Purple/blue gradients (overused in AI output)
- Pure grays (#333, #666, #999) - use tinted neutrals
- Uniform spacing (everything 16px or 24px)
- Solid white backgrounds without texture/gradients

**Prefer Intentional Choices:**
- Distinctive typography with strong hierarchy (3x+ size ratios, extreme weight contrasts)
- Committed color palettes (one dominant color, 1-2 accents)
- Generous, varied spacing (asymmetric layouts, breathing room)
- Layered backgrounds (gradients, patterns, depth)
- Clear visual hierarchy (primary focus, secondary elements, tertiary support)

Remember: Users can request refinements, but cannot salvage generic foundations. When in doubt between "safe" and "distinctive," choose distinctive.

# Parameters
All parameters are MANDATORY.
- xmlStructure
- elementConfig
- stylesConfig

If unsure about the configuration of a specific property, read the schema resources carefully.

# About our widgets
Most widgets are self-explanatory by their name. Here is some additional information.
Check for available llm_guidance property in the widget's schema.
SVG elements are bound to internal content upload. Avoid usage, unless you have tools to upload SVG content.
When working with containers, do not forget to apply style schema for controlling the layout.


  ` );

	buildCompositionsToolPrompt.example( `
A Heading and a button inside a flexbox
{
  xmlStructure: "<e-flexbox configuration-id=\"flex1\"><e-heading configuration-id=\"heading1\"></e-heading><e-button configuration-id=\"button1\"></e-button></e-flexbox>",
  elementConfig: {
    "flex1": {
      "tag": {
        "$$type": "string",
        "value": "section"
      }
    },
    "heading1": {
      "title": {
        "$$type": "string",
        "value": "Welcome"
      }
    },
    "button1": {
      "text": {
        "$$type": "string",
        "value": "Click Me"
      }
    }
  },
  stylesConfig: {
    "flex1": {
      "display": {
        "$$type": "string",
        "value": "flex"
      },
      "flex-direction": {
        "$$type": "string",
        "value": "column"
      },
      "align-items": {
        "$$type": "string",
        "value": "center"
      },
      "padding": {
        "$$type": "spacing",
        "value": {
          "top": { "$$type": "size", "value": { "size": { "$$type": "number", "value": 80 }, "unit": { "$$type": "string", "value": "px" } } },
          "bottom": { "$$type": "size", "value": { "size": { "$$type": "number", "value": 80 }, "unit": { "$$type": "string", "value": "px" } } },
          "left": { "$$type": "size", "value": { "size": { "$$type": "number", "value": 32 }, "unit": { "$$type": "string", "value": "px" } } },
          "right": { "$$type": "size", "value": { "size": { "$$type": "number", "value": 32 }, "unit": { "$$type": "string", "value": "px" } } }
        }
      },
      "gap": {
        "$$type": "size",
        "value": {
          "size": { "$$type": "number", "value": 48 },
          "unit": { "$$type": "string", "value": "px" }
        }
      }
    },
    "heading1": {
      "font-size": {
        "$$type": "size",
        "value": {
          "size": { "$$type": "number", "value": 32 },
          "unit": { "$$type": "string", "value": "px" }
        }
      },
      "color": {
        "$$type": "color",
        "value": { "$$type": "string", "value": "#2d2622" }
      }
    }
  }
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
		'stylesConfig',
		`**MANDATORY** A record mapping style PropTypes to their corresponding style configuration objects, defining the PropValues for styles to be applied to elements.`
	);

	buildCompositionsToolPrompt.instruction(
		`You will be provided the XML structure with element IDs. These IDs represent the actual elementor widgets created on the page/post.
You should use these IDs as reference for further configuration, styling or changing elements later on.`
	);

	buildCompositionsToolPrompt.instruction(
		`Always check elementor://global-classes and elementor://global-variables resources BEFORE building. Prefer using existing global variables in PropValues and applying global classes after building using the "apply-global-class" tool.`
	);

	return buildCompositionsToolPrompt.prompt();
};
