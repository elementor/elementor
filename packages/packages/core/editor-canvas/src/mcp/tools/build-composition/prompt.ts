import { toolPrompts } from '@elementor/editor-mcp';

import { STYLE_SCHEMA_URI, WIDGET_SCHEMA_URI } from '../../resources/widgets-schema-resource';

export const generatePrompt = () => {
	const buildCompositionsToolPrompt = toolPrompts( 'build-compositions' );

	buildCompositionsToolPrompt.description( `
# REQUIRED RESOURCES (Read before use)
1. [${ WIDGET_SCHEMA_URI }] - Widget types, configuration schemas, and PropType definitions
2. [${ STYLE_SCHEMA_URI }] - Common styles schema shared by all widgets
3. [elementor://global-classes] - Existing global classes (check FIRST to reuse)
4. [elementor://global-variables] - Existing global variables

# THREE-PHASE WORKFLOW (MANDATORY)

## Phase 1: Create Global Classes
1. Analyze requirements → identify reusable patterns (typography, colors, spacing)
2. Check [elementor://global-classes] for existing classes
3. Use "create-global-class" tool for NEW reusable styles BEFORE building

## Phase 2: Build Composition (THIS TOOL)
4. Build valid XML with minimal inline styles (layout/positioning only)
5. Avoid duplicating styles that should be global classes

## Phase 3: Apply Classes
6. Use "apply-global-class" tool to apply global classes to elements

# CORE INSTRUCTIONS

**Structure:**
- Build valid XML using allowed widget tags (e.g., \`<e-button configuration-id="btn1"></e-button>\`)
- Containers only: "e-flexbox", "e-div-block", "e-tabs"
- Every element MUST have unique "configuration-id" attribute
- No attributes, classes, IDs, or text nodes in XML

**Configuration:**
- Map each configuration-id to elementConfig (widget props) and stylesConfig (styles)
- Follow exact PropType schemas from resources above
- All PropValues need \`$$type\` property matching schema
- Keep stylesConfig MINIMAL - layout only, NOT reusable styles

**Validation:**
- Parse XML before submission
- Match all PropValues to schema (\`$$type\` required)
- NO LINKS in any configuration
- Retry on errors up to 10x, reading error messages carefully

**Usage of variables and classes**
Using variables from global context will throw error - THIS IS IMPORTANT
Use existing global classes, or create if none matches the requirements

# DESIGN QUALITY: AVOID AI SLOP

**Problem:** LLMs default to generic patterns (purple gradients, #333 grays, 24px headings, uniform spacing)
**Solution:** Make intentional, distinctive choices. When unsure, choose bold over safe.

## Typography Rules
❌ AVOID: Inter/Roboto/Arial, small ratios (1.5x), medium weights (500-700)
✅ USE: 3x+ size ratios, extreme weight contrasts (100/200 vs 800/900), tight headlines (1.1 line-height)

## Color Rules
❌ AVOID: Purple gradients, pure grays (#333/#666/#999), even distribution
✅ USE: ONE dominant color (60-70%), 1-2 accent colors (10-15%), tinted neutrals (warm/cool grays)

## Spacing Rules
❌ AVOID: Uniform spacing (all 16px/24px), cramped layouts, centered everything
✅ USE: Generous spacing (80-120px sections), dramatic variation (12px/48px/96px), asymmetric layouts

## Background Rules
❌ AVOID: Solid white/gray, single colors
✅ USE: Layered gradients (2-3 layers), subtle patterns, alternating light/dark sections

## Visual Hierarchy
1. **Primary** (1 element): Largest, highest contrast, most space
2. **Secondary** (2-3 elements): 40-60% of primary size
3. **Tertiary** (rest): Minimal weight, muted

**Contrast techniques:** 3x size differences, 300+ weight differences, color hierarchy (brand → neutral → muted)

# DESIGN CONSTRAINTS (NEVER VIOLATE)

**Typography:**
- NEVER use Inter, Roboto, Arial, Helvetica as primary display fonts
- NEVER use font-size ratios < 2.5x between headlines and body
- NEVER use font-weight 500-700 for headlines (go lighter or heavier)
- USE VARIABLES ONLY FROM [elementor://global-variables]

**Color:**
- PREFER not to use pure grays - use tinted neutrals (#2d2622, #faf8f6, not #333/#f5f5f5)
- NEVER distribute colors evenly - commit to ONE dominant
- NEVER use more than 3 core colors - except for info/alert/badges

**Spacing:**
- NEVER use uniform spacing
- NEVER use < 4rem (64px) padding for major sections
- NEVER center everything
- PRIORITIZE rem based values over pixel based

**Background:**
- NEVER use solid #ffffff or #f5f5f5 without texture/gradients
- ALWAYS layer 2+ gradient/color elements

# WIDGET NOTES
- Check \`llm_guidance\` property in widget schemas for context
- Avoid SVG widgets (require content upload tools) - when must, prior to execution ensure assets uploaded
- Apply style schema to containers for layout control

# PARAMETERS (ALL MANDATORY)
- **xmlStructure**: Valid XML with configuration-id attributes
- **elementConfig**: Record of configuration-id → widget PropValues
- **stylesConfig**: Record of configuration-id → style PropValues (layout only)
- **customCSS**: Record of configuration-id → custom CSS - do not use selectors, only the css rules, separated by semicolons
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
	customCSS: {
		"flex1": "background-color: #f5f5f5; padding: 2rem;"
	},
  stylesConfig: {
    "heading1": {
      "font-size": {
        "$$type": "size",
        "value": {
          "size": { "$$type": "number", "value": 24 },
          "unit": { "$$type": "string", "value": "px" }
        }
      },
      "color": {
        "$$type": "color",
        "value": { "$$type": "string", "value": "#333" }
      }
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
		'stylesConfig',
		`**MANDATORY** A record mapping style PropTypes to their corresponding style configuration objects, defining the PropValues for styles to be applied to elements.`
	);

	buildCompositionsToolPrompt.instruction(
		`You will be provided the XML structure with element IDs. These IDs represent the actual elementor widgets created on the page/post.
You should use these IDs as reference for further configuration, styling or changing elements later on.`
	);

	buildCompositionsToolPrompt.instruction(
		`**CRITICAL WORKFLOW REMINDER**:
1. FIRST: Create reusable global classes for typography, colors, spacing patterns using "create-global-class" tool
2. SECOND: Use THIS tool with minimal inline styles (only layout & unique properties)
3. THIRD: Apply global classes to elements using "apply-global-class" tool

This ensures maximum reusability and consistency across your design system. ALWAYS check [elementor://global-classes] for existing classes before creating new ones.`
	);

	return buildCompositionsToolPrompt.prompt();
};
