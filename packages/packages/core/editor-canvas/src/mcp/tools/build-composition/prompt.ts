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
9. **CRITICAL - CUSTOM CSS PRIORITY**: Prefer using style schema. Custom CSS is ONLY FOR UNSUPPRTED schema styles.
   ALWAYS PRIORITIZE using the style schema PropValues for styling elements as they provide better user experience in the editor, and UI features for the end-users.
   - Use custom_css only for style attributes that ARE NOT SUPPORTED via the style schema.

# DESIGN VECTORS - Concrete Implementation Guidance

## 1. Typography & Visual Hierarchy

**Avoid Distributional Defaults:**
- NO generic sans-serifs as primary typefaces (Inter, Roboto, Arial, Helvetica)
- NO timid size ratios (1.2x, 1.5x scaling)
- NO uniform font weights (everything at 400 or 600)

**Intentional Alternatives:**
- **For Technical/Modern**: Consider monospace headlines (JetBrains Mono, SF Mono) paired with clean body text
- **For Editorial/Elegant**: Consider serif headlines (Playfair Display, Crimson Text) with sans-serif body
- **For Playful/Creative**: Consider display fonts with character, paired with highly legible body text

**Scale & Contrast Implementation:**
- Headline-to-body size ratios: 3x minimum (e.g., 48px headline vs 16px body)
- Use extreme weight contrasts: pair weight-100 or 200 with weight-800 or 900
- Line height contrasts: tight headlines (1.1) vs. generous body (1.7)
- Letter spacing: compressed headlines (-0.02em to -0.05em) vs. open small text (0.03em+)

**Hierarchy Mapping:**
/* Intentional hierarchy example */
H1: font-size: 3.5rem; font-weight: 900; line-height: 1.1; letter-spacing: -0.03em;
H2: font-size: 2rem; font-weight: 200; line-height: 1.2;
Body: font-size: 1rem; font-weight: 400; line-height: 1.7;
Caption: font-size: 0.75rem; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;

## 2. Color & Theme Strategy

**Avoid Distributional Defaults:**
- NO purple gradients or blue-purple color schemes (massively overrepresented in AI output)
- NO evenly-distributed color palettes (3-4 colors used equally)
- NO timid pastels or all-neutral schemes
- NO #333333, #666666, #999999 grays

**Intentional Alternatives:**
- **Commit to a Dominant Color**: Choose ONE primary brand color that appears in 60-70% of colored elements
- **Sharp Accent Strategy**: Use 1-2 high-contrast accent colors sparingly (10-15% of colored elements)
- **Neutrals with Personality**: Replace pure grays with warm (#3d3228, #f5f1ed) or cool (#2a2f3d, #f0f2f5) tinted neutrals

**Color Psychology Mapping:**
- Energy/Action → Warm reds, oranges, yellows (NOT purple/blue)
- Trust/Calm → Deep teals, forest greens (NOT generic blue)
- Luxury/Premium → Deep burgundy, emerald, charcoal with gold accents
- Playful/Creative → Unexpected combinations (coral + mint, mustard + navy)

**Implementation:**
/* Intentional color system example */
--brand-primary: #d84315;        /* Dominant: Deep orange */
--brand-accent: #00bfa5;         /* Accent: Teal (complementary) */
--neutral-dark: #2d2622;         /* Warm dark brown, not #333 */
--neutral-light: #faf8f6;        /* Warm off-white, not pure white */
--background: linear-gradient(135deg, #faf8f6 0%, #f0ebe6 100%); /* Subtle warmth */

## 3. Spatial Design & White Space

**Avoid Distributional Defaults:**
- NO uniform spacing (everything 16px or 24px)
- NO cramped layouts that maximize content density
- NO default container widths (1200px, 1440px)

**Intentional Alternatives:**
- **Breathing Room**: Use generous white space as a design element (80-120px vertical spacing between sections)
- **Asymmetric Spacing**: Vary padding dramatically (small: 12px, medium: 48px, large: 96px)
- **Content Width Strategy**:
  - Reading content: max 65-75 characters (600-700px)
  - Hero sections: asymmetric layouts, not centered blocks
  - Cards/components: vary sizes intentionally, not uniform grids

**Implementation:**
/* Intentional spacing scale */
--space-xs: 0.5rem;   /* 8px */
--space-sm: 1rem;     /* 16px */
--space-md: 3rem;     /* 48px */
--space-lg: 6rem;     /* 96px */
--space-xl: 10rem;    /* 160px */

/* Use in combinations: */
padding: var(--space-lg) var(--space-md);  /* Not uniform padding */
margin-bottom: var(--space-xl);            /* Generous section breaks */

## 4. Backgrounds & Atmospheric Depth

**Avoid Distributional Defaults:**
- NO solid white or light gray backgrounds
- NO single-color backgrounds
- NO generic gradient overlays

**Intentional Alternatives:**
- **Layered Gradients**: Combine 2-3 subtle gradients for depth
- **Geometric Patterns**: SVG patterns, mesh gradients, or subtle noise textures
- **Strategic Contrast**: Alternate between light and dark sections for rhythm

**Implementation:**
/* Intentional background example */
background:
  radial-gradient(circle at 20% 30%, rgba(216, 67, 21, 0.08) 0%, transparent 50%),
  radial-gradient(circle at 80% 70%, rgba(0, 191, 165, 0.06) 0%, transparent 50%),
  linear-gradient(135deg, #faf8f6 0%, #f0ebe6 100%);

## 5. Visual Hierarchy Principles

**Clear Priority System:**
1. **Primary Focus (1 element)**: Largest, highest contrast, most visual weight
2. **Secondary Elements (2-3 elements)**: 40-60% of primary size, reduced contrast
3. **Tertiary/Support (everything else)**: Minimal visual weight, muted colors

**Contrast Techniques:**
- Size: 3x+ differences between hierarchy levels
- Weight: 300+ difference in font-weight values
- Color: Primary gets brand color, secondary gets neutral, tertiary gets muted
- Space: Primary gets 2x+ surrounding white space vs. secondary

## 6. EXAMPLES - Intentional vs. Generic Design

### ❌ GENERIC (Distributional Convergence)

{
  "xmlStructure": "<e-flexbox configuration-id=\"flex1\"><e-heading configuration-id=\"heading1\"></e-heading><e-button configuration-id=\"button1\"></e-button></e-flexbox>",
  "elementConfig": {
    "heading1": {
      "title": { "$$type": "string", "value": "Welcome to Our Site" }
    }
  },
  "stylesConfig": {
    "heading1": {
      "font-size": {
        "$$type": "size",
        "value": {
          "size": { "$$type": "number", "value": 24 },
          "unit": { "$$type": "string", "value": "px" }
        }
      },
    },
    "button1": {
      "custom_css": "background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 12px 24px;"
    }
  }
}

**Why Generic**: 24px default size, #333 safe gray, 600 weight (middle-ground), purple gradient (AI cliché), uniform 12/24px padding

### ✅ INTENTIONAL (Resisting Convergence)
{
  "xmlStructure": "<e-flexbox configuration-id=\"hero-section\"><e-heading configuration-id=\"hero-title\"></e-heading><e-text configuration-id=\"hero-subtitle\"></e-text><e-button configuration-id=\"hero-cta\"></e-button></e-flexbox>",
  "elementConfig": {
    "hero-title": {
      "title": { "$$type": "string", "value": "Transform Your Workflow" }
    },
    "hero-subtitle": {
      "content": { "$$type": "string", "value": "Built for teams who refuse to compromise on quality" }
    }
  },
  "stylesConfig": {
    "hero-section": {
      "custom_css": "display: flex; flex-direction: column; align-items: flex-start; gap: 3rem; background: radial-gradient(circle at 30% 20%, rgba(216, 67, 21, 0.1) 0%, transparent 60%), linear-gradient(135deg, #faf8f6 0%, #f0ebe6 100%); padding: 10rem 3rem;"
    },
    "hero-title": {
      "custom_css": "font-size: 4.5rem; font-weight: 900; line-height: 1.05; letter-spacing: -0.04em; color: #2d2622; max-width: 700px;"
    },
    "hero-subtitle": {
      "custom_css": "font-size: 1.25rem; font-weight: 200; line-height: 1.7; letter-spacing: 0.01em; color: #5a534d; max-width: 600px;"
    },
    "hero-cta": {
      "custom_css": "background: #d84315; color: #ffffff; padding: 1.25rem 3rem; font-size: 1rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; border-radius: 2px; box-shadow: 0 4px 16px rgba(216, 67, 21, 0.25); transition: transform 0.15s ease-out, box-shadow 0.15s ease-out;"
    }
  }
}


**Why Intentional**:
- Typography: 4.5rem headline (3.6x body), weight 900 vs 200 contrast, tight leading
- Color: Warm orange primary (#d84315), warm neutrals (#2d2622, #5a534d) NOT #333/#666
- Spacing: 10rem vertical padding (generous), 3rem gap, asymmetric alignment
- Background: Layered gradients with subtle brand color accent

# CONSTRAINTS
When a tool execution fails, retry up to 10 more times, read the error message carefully, and adjust the XML structure or the configurations accordingly.
If a "$$type" is missing, update the invalid object, if the XML has parsing errors, fix it, etc. and RETRY.
VALIDATE the XML structure before delivering it as the final result.
VALIDATE the JSON structure used in the "configuration" attributes for each element before delivering the final result. The configuration must MATCH the PropValue schemas.
NO LINKS ALLOWED. Never apply links to elements, even if they appear in the PropType schema.
elementConfig values must align with the widget's PropType schema, available at the resource [${ WIDGET_SCHEMA_URI }].
stylesConfig values must align with the common styles PropType schema, available at the resource [${ STYLE_SCHEMA_URI }].

# DESIGN QUALITY CONSTRAINTS

**Typography Constraints:**
- NEVER use Inter, Roboto, Arial, or Helvetica as primary display fonts
- NEVER use font-size ratios smaller than 2.5x between headlines and body
- NEVER use font-weight values between 500-700 for headlines (go lighter or heavier)

**Color Constraints:**
- NEVER use purple gradients or blue-purple color schemes
- NEVER use pure grays (#333, #666, #999) - use tinted neutrals instead
- NEVER distribute colors evenly - commit to ONE dominant color
- NEVER use more than 3 core colors (1 dominant, 1-2 accents)

**Spacing Constraints:**
- NEVER use uniform spacing across all elements
- NEVER use section padding less than 4rem (64px) for hero/major sections
- NEVER center everything - use asymmetric layouts for visual interest

**Background Constraints:**
- NEVER use solid white (#ffffff) or light gray (#f5f5f5) backgrounds without texture/gradients
- ALWAYS layer at least 2 gradient or color elements for atmospheric depth

# Parameters
All parameters are MANDATORY.
- xmlStructure
- elementConfig
- stylesConfig

If unsure about the configuration of a specific property, read the schema resources carefully.

# About our widgets
Most widgets are self-explanatory by their name. Here is some additional information.
SVG elements are bound to internal content upload. Avoid usage, unless you have tools to upload SVG content.
e-div-block - By default is ceneterd aligned and vertically stacked. To modify this, apply style configuration.
e-flexbox - By default is a flex container with row direction. To modify this, apply style configuration.
e-tabs - Auto generates it's own menu. Every child element is represented in a tab. Prefer Use containers as first-level children.

When working with containers, do not forget to apply style schema for controlling the layout.


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
  stylesConfig: {
    "flex1": {
      "custom_css": "background: radial-gradient(circle at 20% 30%, rgba(216, 67, 21, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(0, 191, 165, 0.06) 0%, transparent 50%), linear-gradient(135deg, #faf8f6 0%, #f0ebe6 100%); display: flex; flex-direction: column; align-items: center; padding: 80px 32px; gap: 48px;"
    },
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
		`You must use styles/variables/classes that are available in the project resources, you should prefer using them over inline styles, and you are welcome to execute relevant tools AFTER this tool execution, to apply global classes to the created elements.`
	);

	return buildCompositionsToolPrompt.prompt();
};
