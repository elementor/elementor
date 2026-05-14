import { toolPrompts } from '@elementor/editor-mcp';
import { isProActive } from '@elementor/utils';

export const MANAGE_VARIABLES_GUIDE_URI = 'elementor://variables/tools/manage-global-variable-guide';

export const generateVariablesPrompt = () => {
	const prompt = toolPrompts( 'manage-global-variable' );
	const proIsActive = isProActive();

	const sizeVariableSection = proIsActive
		? `- **global-size-variable** — A simple CSS length with a unit (Elementor Pro). Use this for fixed spacing, font sizes, or layout values. Example: \`16px\`, \`1.5rem\`, \`2em\`, \`10vh\`
- **global-custom-size-variable** — Any CSS size expression that goes beyond a simple number + unit (Elementor Pro). Use this when the value is a CSS function, a keyword, or a combination of units that \`global-size-variable\` cannot represent. Example: \`auto\`, \`clamp(1rem, 2vw, 2rem)\`, \`calc(100% - 32px)\`, \`min(50vw, 600px)\`, \`300ms\`, \`2ch\`. When in doubt: if the value contains a function call or a keyword, use \`global-custom-size-variable\`.`
		: `- ~~global-size-variable~~ — requires Elementor Pro (not available on this site)
- ~~global-custom-size-variable~~ — requires Elementor Pro (not available on this site)`;

	prompt.description( `
# Purpose
Create, update, or delete V4 global CSS variables. These are distinct from legacy v3 globals and map 1:1 to \`--css-var: VALUE\`.

# Available Types
- **global-color-variable** — CSS color value. Example: \`#FF0000\`, \`rgba(255,0,0,1)\`, \`hsl(0,100%,50%)\`
- **global-font-variable** — Font family name ONLY — NOT a size or px value. Example: \`Roboto\`, \`Open Sans\`. NEVER pass px/rem here.
${ sizeVariableSection }

# Naming Rules
- Labels must be **lowercase**, using only letters (a-z), numbers, digits (0-9), dashes (-), or underscores (_)
- No spaces, no special characters
- Example: "Headline Primary" → \`headline-primary\`
- Labels must be unique — always check [elementor://global-variables] first

# Value Rules
- Provide a **plain CSS value** only — do NOT pass JSON, legacy-globals object structures, or variable references
- Values are inserted as-is: \`--css-var: <value>\`
- NEVER store a px/rem value inside a \`global-font-variable\` — use \`global-size-variable\` (Pro) instead

# Operations
- **create** — requires \`type\`, \`label\`, \`value\`. Label must be unique.
- **update** — requires \`id\`, \`label\`, \`value\`. Get \`id\` from [elementor://global-variables]. When renaming: keep existing value. When changing value: keep exact existing label.
- **delete** — requires \`id\`. DESTRUCTIVE — always confirm with user before executing.
` );

	prompt.parameter( 'action', '"create", "update", or "delete".' );
	prompt.parameter( 'type', 'Variable type. Required for create. See Available Types above.' );
	prompt.parameter( 'label', 'Variable name (lowercase, dash-separated). Required for create/update.' );
	prompt.parameter(
		'value',
		'Plain CSS value matching the variable type. Required for create/update. Do NOT pass JSON.'
	);
	prompt.parameter( 'id', 'Variable ID. Required for update/delete. Obtain from [elementor://global-variables].' );

	prompt.example( `
Create a brand color:
{ "action": "create", "type": "global-color-variable", "label": "brand-primary", "value": "#1A73E8" }

Create a heading font:
{ "action": "create", "type": "global-font-variable", "label": "font-heading", "value": "Playfair Display" }

Create a simple spacing size:
{ "action": "create", "type": "global-size-variable", "label": "spacing-md", "value": "16px" }

Create a fluid/responsive size using a CSS function (use global-custom-size-variable, NOT global-size-variable):
{ "action": "create", "type": "global-custom-size-variable", "label": "spacing-fluid", "value": "clamp(1rem, 2vw, 2rem)" }

Create a size that is a keyword:
{ "action": "create", "type": "global-custom-size-variable", "label": "width-auto", "value": "auto" }

Create a size using calc():
{ "action": "create", "type": "global-custom-size-variable", "label": "sidebar-width", "value": "calc(100% - 32px)" }

Update a variable's value (keep exact label):
{ "action": "update", "id": "abc123", "label": "brand-primary", "value": "#0D47A1" }

Rename a variable (keep existing value):
{ "action": "update", "id": "abc123", "label": "brand-secondary", "value": "#1A73E8" }

Delete a variable:
{ "action": "delete", "id": "abc123" }
` );

	prompt.instruction(
		'Always read [elementor://global-variables] before creating to check existing variables and avoid duplicate labels.'
	);

	return prompt.prompt();
};
