import { toolPrompts } from '@elementor/editor-mcp';
import { isProActive } from '@elementor/utils';

export const MANAGE_VARIABLES_GUIDE_URI = 'elementor://variables/tools/manage-global-variable-guide';

export const generateVariablesPrompt = () => {
	const prompt = toolPrompts( 'manage-global-variable' );
	const proIsActive = isProActive();

	const sizeVariableSection = proIsActive
		? `- **global-size-variable** — CSS size value with a unit (Elementor Pro). Example: \`16px\`, \`1.5rem\`, \`2em\`, \`10vh\``
		: `- ~~global-size-variable~~ — requires Elementor Pro (not available on this site)`;

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
