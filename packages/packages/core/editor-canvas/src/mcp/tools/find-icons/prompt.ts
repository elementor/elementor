import { toolPrompts } from '@elementor/editor-mcp';

export const findIconsToolPrompt = toolPrompts( 'find-icons' );

findIconsToolPrompt.description(
	'Finds icons for the `svg` property of an `e-svg` element, across Font Awesome and any icon packs uploaded to this site. ' +
		'Returns the exact `value` and `library` pair to write - never assemble those strings yourself, and never guess an icon name. ' +
		'Call this before placing or configuring an `e-svg`. Nothing has to be uploaded to the Media Library for an icon to work.'
);

findIconsToolPrompt.instruction(
	'Call it when the user names an icon ("use the cart-shopping icon") and take the first exact `name` match, ' +
		'and also when the user describes a page and you decide icons belong in it ("create a product page") - ' +
		'in that case pass one query per icon you intend to place, in a single call.'
);

findIconsToolPrompt.instruction(
	'Write queries the way a person would describe the icon ("shopping cart", "credit card", "phone"). Icons are matched on ' +
		'their name, aliases, label, Font Awesome search terms and category, so plain language works better than guessed icon names.'
);

findIconsToolPrompt.instruction(
	'Results are ordered best first; `matched_on: "name"` is a stronger signal than `matched_on: "term"`. ' +
		'All results are free icons from Font Awesome free packages. ' +
		'Prefer `fa-solid` for UI iconography and keep one style across a page; brand marks only exist in `fa-brands`. ' +
		'An empty `matches` array means no match was found: broaden the phrase instead of inventing a value.'
);

findIconsToolPrompt.instruction(
	'Pass the chosen pair to `configure-element` as the `svg` property: ' +
		'{ "$$type": "icon", "value": { "value": { "$$type": "string", "value": "fa-solid fa-cart-shopping" }, ' +
		'"library": { "$$type": "string", "value": "fa-solid" } } }. ' +
		'An `e-svg` has no colour or size of its own, so set `width`, `height` and `color` in the same `configure-element` call.'
);

findIconsToolPrompt.example( `Icon named by the user:
{ "queries": ["cart-shopping"] }` );

findIconsToolPrompt.example( `Every icon a product page needs, in one call:
{ "queries": ["add to cart", "free shipping", "secure payment", "instagram"] }` );

findIconsToolPrompt.example( `Browse a category, one style only:
{ "category": "shopping", "library": "fa-solid", "perPage": 25 }` );
