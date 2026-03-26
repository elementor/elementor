import { getWidgetsCache } from '@elementor/editor-elements';
import { toolPrompts } from '@elementor/editor-mcp';

function generateChildTypeConstraints(): string {
	const widgetsCache = getWidgetsCache() || {};
	const lines: string[] = [];

	for ( const [ elementType, config ] of Object.entries( widgetsCache ) ) {
		const allowedTypes = ( config as Record< string, unknown > ).allowed_child_types as string[] | undefined;
		if ( ! allowedTypes?.length ) {
			continue;
		}
		lines.push(
			`- \`${ elementType }\` ONLY accepts these children: ${ allowedTypes
				.map( ( t ) => `\`${ t }\`` )
				.join( ', ' ) }`
		);
	}

	return lines.length ? `\nChild type restrictions (violations will throw errors):\n${ lines.join( '\n' ) }\n` : '';
}

export const generatePrompt = () => {
	const buildCompositionsToolPrompt = toolPrompts( 'build-compositions' );

	buildCompositionsToolPrompt.description( `
# RESOURCES (Read before use)
- [elementor://global-classes] - Check FIRST for reusable classes
- [elementor://global-variables] - ONLY use variables defined here

# WORKFLOW
1. Check/create global classes via "create-global-class" tool
2. Build composition (THIS TOOL) - minimal inline styles
3. Apply classes via "apply-global-class" tool

# XML STRUCTURE
- Use widget tags: \`<e-button configuration-id="btn1"></e-button>\`
- Containers: "e-flexbox", "e-div-block", "e-tabs"
- Every element needs unique "configuration-id"
- No attributes, classes, IDs, or text nodes in XML

## COMPOUND ELEMENTS
Some elements have an internal tree structure. You must build the FULL tree in XML.

**e-tabs** — Tabbed content with trigger buttons and panels.
Required tree structure:
\`\`\`
e-tabs
  e-tabs-menu (locked container for tab triggers)
    e-tab (one per tab — contains the tab label widget)
      e-paragraph (tab label text)
    e-tab ...
  e-tabs-content-area (locked container for panels)
    e-tab-content (one per tab — holds the panel content)
      ...any widgets...
    e-tab-content ...
\`\`\`

${ generateChildTypeConstraints() }
- Number of \`e-tab\` MUST equal number of \`e-tab-content\`
- \`e-tab\` contains a single \`e-paragraph\` for the label text
- Inside \`e-tab-content\`, any widget is allowed

Example — 3-tab layout:
\`\`\`xml
<e-tabs configuration-id="Product Tabs">
  <e-tabs-menu configuration-id="Tab Menu">
    <e-tab configuration-id="Features Tab">
      <e-paragraph configuration-id="Features Tab Label"></e-paragraph>
    </e-tab>
    <e-tab configuration-id="Pricing Tab">
      <e-paragraph configuration-id="Pricing Tab Label"></e-paragraph>
    </e-tab>
    <e-tab configuration-id="FAQ Tab">
      <e-paragraph configuration-id="FAQ Tab Label"></e-paragraph>
    </e-tab>
  </e-tabs-menu>
  <e-tabs-content-area configuration-id="Content Area">
    <e-tab-content configuration-id="Features Panel">
      <e-heading configuration-id="Features Heading"></e-heading>
      <e-paragraph configuration-id="Features Text"></e-paragraph>
    </e-tab-content>
    <e-tab-content configuration-id="Pricing Panel">
      <e-heading configuration-id="Pricing Heading"></e-heading>
      <e-paragraph configuration-id="Pricing Text"></e-paragraph>
    </e-tab-content>
    <e-tab-content configuration-id="FAQ Panel">
      <e-heading configuration-id="FAQ Heading"></e-heading>
      <e-paragraph configuration-id="FAQ Text"></e-paragraph>
    </e-tab-content>
  </e-tabs-content-area>
</e-tabs>
\`\`\`

# CONFIGURATION
- Map configuration-id → elementConfig (props) + stylesConfig (layout only)
- All PropValues require \`$$type\` matching schema
- NO LINKS in configuration
- Retry on errors up to 10x

Note about configuration ids: These names are visible to the end-user, make sure they make sense, related and relevant.

# DESIGN PHILOSOPHY: CONTEXT-DRIVEN CREATIVITY

**Use the user's context aggressively.** Business type, brand personality, target audience, and purpose should drive every design decision. A law firm needs gravitas; a children's app needs playfulness. Don't default to generic.

## SIZING: DEFAULT IS NO SIZE (CRITICAL)

**DO NOT specify height or width unless you have a specific visual reason.**

Flexbox and CSS already handle sizing automatically:
- Containers grow to fit their content
- Flex children distribute space via flex properties, not width/height
- Text elements size to their content

WHEN TO SPECIFY SIZE:
- min-height on ROOT section for viewport-spanning hero (use min-height, NOT height)
- max-width for contained content areas (e.g., max-width: 60rem)
- Explicit aspect ratios for media containers

NEVER SPECIFY:
- height on nested containers (causes overflow)
- width on flex children (use flex-basis or gap instead)
- 100vh on anything except root-level sections
- Any size "just to be safe" - if unsure, OMIT IT

vh units are VIEWPORT-relative. Nested 100vh inside 100vh = 200vh overflow.

GOOD: \`<e-flexbox>content naturally sizes</e-flexbox>\`
BAD: \`<e-flexbox style="height:100vh"><e-div-block style="height:100vh">overflow</e-div-block></e-flexbox>\`

## Layout Variety (Break the Template)
- AVOID: Full-width 100vh hero → three columns → testimonials → CTA (every AI does this)
- VARY heights: Use auto-height sections with generous padding (6rem+). Let content breathe
- VARY widths: Not everything spans full width. Use contained sections (max-width: 960px) mixed with edge-to-edge
- ASYMMETRIC grids: 2:1, 1:3, offset layouts. Avoid equal column widths
- Negative space as design element: Large margins create focus and sophistication
- Break alignment intentionally: Offset headings, overlapping elements, broken grids

## Visual Depth & Effects
- Layer elements: Overlapping cards, text over images, floating elements
- Subtle shadows with color tint (not pure black): \`box-shadow: 0 20px 60px rgba(<brand-color-here>, 0.15)\`
- Gradient overlays on images for text readability
- Border radius variation: Mix sharp (0) and soft (1rem+) corners purposefully
- Backdrop blur for glassmorphism where appropriate
- Micro-interactions via CSS: hover transforms, transitions (0.3s ease)

## Typography with Character
- Display fonts for headlines (from user's brand or contextually appropriate)
- Size contrast: 4rem+ headlines vs 1rem body. Make hierarchy unmistakable
- Letter-spacing: Tight for large headlines (-0.02em), loose for small caps (0.1em)
- Line-height: Tight for headlines (1.1), generous for body (1.6-1.8)
- Text decoration: Underlines, highlights, gradient text for emphasis

## Color with Purpose
- Extract palette from user context (brand colors, industry norms, mood)
- 60-30-10 rule: dominant, secondary, accent
- Tinted neutrals over pure grays: warm (#faf8f5, #2d2a26) or cool (#f5f7fa, #1e2430)
- Color blocking: Large colored sections create visual rhythm
- Gradient directions: Diagonal (135deg, 225deg) feel more dynamic than vertical

## Spacing Strategy
- Section padding: 6rem-10rem vertical, creating breathing room
- Rhythm variation: Tight groups (2rem) with generous gaps between (6rem)
- Use rem/em exclusively for responsive scaling
- Generous padding on CTAs: min 1rem 2.5rem

# HARD CONSTRAINTS
- Variables ONLY from [elementor://global-variables] (others throw errors)
- Avoid SVG widgets unless assets are pre-uploaded
- Check \`llm_guidance\` in widget schemas

# PARAMETERS
- **xmlStructure**: Valid XML with configuration-id attributes
- **elementConfig**: configuration-id → widget PropValues
- **stylesConfig**: configuration-id → style PropValues (layout only)
- **customCSS**: configuration-id → CSS rules (no selectors, semicolon-separated)
  ` );

	buildCompositionsToolPrompt.example( `
Section with heading + button (NO explicit heights - content sizes naturally):
{
  xmlStructure: "<e-flexbox configuration-id="Main Section"><e-heading configuration-id="Section Title"></e-heading><e-button configuration-id="Call to Action"></e-button></e-flexbox>",
  elementConfig: {
    "section1": { "tag": { "$$type": "string", "value": "section" } }
  },
  customCSS: {
    "Section Title": "padding: 6rem 4rem; background: linear-gradient(135deg, #faf8f5 0%, #f0ebe4 100%);"
  },
  stylesConfig: {
    "Section Title": {
      "font-size": { "$$type": "size", "value": { "size": { "$$type": "number", "value": 3.5 }, "unit": { "$$type": "string", "value": "rem" } } },
      "color": { "$$type": "color", "value": { "$$type": "string", "value": "#2d2a26" } }
    }
  }
}
Note: No height/width specified on any element - flexbox handles layout automatically.
` );

	buildCompositionsToolPrompt.parameter(
		'xmlStructure',
		`Valid XML structure with custom elementor tags and configuration-id attributes.`
	);

	buildCompositionsToolPrompt.parameter( 'elementConfig', `Record mapping configuration IDs to widget PropValues.` );

	buildCompositionsToolPrompt.parameter(
		'stylesConfig',
		`Record mapping configuration IDs to style PropValues (layout/positioning only).`
	);

	buildCompositionsToolPrompt.instruction(
		`Element IDs in the returned XML represent actual widgets. Use these IDs for subsequent styling or configuration changes.`
	);

	return buildCompositionsToolPrompt.prompt();
};
