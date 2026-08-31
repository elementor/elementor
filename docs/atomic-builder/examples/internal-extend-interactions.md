# Example: Internal — extend interactions

> Skill: [internal-extend-interactions](../../../.cursor/skills/internal-extend-interactions/SKILL.md)
> Docs: [interactions/editor.md](../interactions/editor.md), [interactions/schema.md](../interactions/schema.md), [interactions/frontend.md](../interactions/frontend.md)
> Verdict: **Relevant with limits** — full outcome requires Core PR; published-page runtime has **no public registration hook**. Editor-only partial integration is insufficient.

## Data model

`interactions` prop: `version` + `items[]` of `interaction-item` PropValues (`interaction_id`, `trigger`, `animation`, `breakpoints`).

## PHP: extend stored schema

```php
add_filter( 'elementor/atomic-widgets/interactions/schema', function ( array $schema ) {
	// $schema holds Interaction_Item_Prop_Type shape entries.
	return $schema;
} );
```

If allowed values change, also update `Validation`, `Presets`, and PropType `->meta( 'pro', … )` in `modules/interactions/props/`.

## Editor: controls + repository (core pattern)

From `packages/packages/core/editor-interactions/src/init.ts`:

```ts
import { getMCPByDomain } from '@elementor/editor-mcp';
import {
	createInteractionsProvider,
	initMcpInteractions,
	interactionsRepository,
	registerInteractionsControl,
} from '@elementor/editor-interactions';

export function init() {
	interactionsRepository.register(
		createInteractionsProvider( {
			key: 'my-interactions-source',
			priority: 50,
			actions: { all: () => [] },
		} )
	);

	registerInteractionsControl( {
		type: 'trigger',
		component: MyTriggerControl,
		options: [ 'load', 'scrollIn' ],
	} );

	initMcpInteractions(
		getMCPByDomain( 'interactions', {
			instructions: 'Short hint',
			docs: 'Full interactions domain docs',
		} )
	);
}
```

Register your package via `elementor/editor/v2/packages` (see [add-editor-package.md](add-editor-package.md)). Editor-only work via this path does **not** complete the skill — frontend runtime still requires Core.

Core free editor registers `trigger: load|scrollIn` only. Pro unlocks additional triggers via companion package in **elementor-pro** (not Core).

## Frontend runtime (core PR only)

`modules/interactions/assets/js/interactions-utils.js`:

```js
function isSupportedInteraction( animationConfig ) {
	if ( ! [ 'load', 'scrollIn', 'scrollOut' ].includes( animationConfig.trigger ) ) {
		return false;
	}
	if ( 'custom' === animationConfig.effect ) {
		return false;
	}
	return true;
}
```

- Triggers `hover`, `click`, `scrollOn` are skipped at runtime.
- Preset effects `fade` / `slide` / `scale` render via `getKeyframes()` — not gated in `isSupportedInteraction()`.
- Editor uses separate `isSupportedInteractionItem()` driven by `registerInteractionsControl` options.

## What third-party plugins cannot do

- Add new Motion.js effects on the live site without core changes to `interactions.js` / `interactions-utils.js`.
- Register frontend triggers/effects via WordPress hooks (none exist).
- Satisfy this skill with editor-only package work alone.

`window.elementorModules.interactions` exposes shared utils to Pro — not an effect registration API.

## Pro fields

PHP PropTypes use `->meta( 'pro', Presets::ADDITIONAL_* )`. Editor Pro unlocks via companion `registerInteractionsControl` options in elementor-pro.
