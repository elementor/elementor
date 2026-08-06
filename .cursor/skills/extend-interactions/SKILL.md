---
name: extend-interactions
description: Extends Elementor v4 interactions — registerInteractionsControl, interactionsRepository.register, elementor/atomic-widgets/interactions/schema filter, Presets and Validation. Use for motion editor UI, interaction-item PropValue, or editor-interactions package; frontend has no public hook.
---

# Extend interactions

Read first: [interactions/editor.md](../../../docs/atomic-builder/interactions/editor.md), [interactions/schema.md](../../../docs/atomic-builder/interactions/schema.md), [interactions/frontend.md](../../../docs/atomic-builder/interactions/frontend.md). Example: [docs/atomic-builder/examples/extend-interactions.md](../../../docs/atomic-builder/examples/extend-interactions.md). Gate: experiment `e_atomic_elements`.

## Checklist

1. **Understand data model** — `interactions` prop: `version` + `items[]` of `interaction-item` PropValues (`interaction_id`, `trigger`, `animation`, `breakpoints`). See [schema.md](../../../docs/atomic-builder/interactions/schema.md).
2. **Extend PHP schema** (if new fields):

```php
add_filter( 'elementor/atomic-widgets/interactions/schema', function ( array $schema ) {
    // mutate Interaction_Item_Prop_Type shape
    return $schema;
} );
```

3. **Editor control** — `registerInteractionsControl( { type, component, options? } )` in package `init()`; match options to `Presets` enums.
4. **Data provider (optional)** — `interactionsRepository.register( createInteractionsProvider( … ) )` during `init()`.
5. **MCP** — `initMcpInteractions( getMCPByDomain( 'interactions', … ) )` pattern in `editor-interactions`; see [mcp/registering-editor-tools.md](../../../docs/atomic-builder/mcp/registering-editor-tools.md).
6. **If allowed values change** — update PHP `Validation` + `Presets`, PropType `meta('pro', …)` in `modules/interactions/props/`, `registerInteractionsControl` options, editor `isSupportedInteractionItem()`, and frontend `isSupportedInteraction()` / `getKeyframes()` in `interactions-utils.js` (core PR).
7. **Do not promise third-party frontend effect plugins** — published-page runtime has **no public registration hook**.

## Public path (limited)

- Filter `elementor/atomic-widgets/interactions/schema` for new stored fields.
- Own editor v2 package: `registerInteractionsControl`, `interactionsRepository.register` in `init()`.
- Cannot add new Motion.js effects on the live site without core changes to `interactions.js` / `interactions-utils.js`.

## Internal path

- PHP: `modules/interactions/` — `Interactions_Schema`, `Presets`, `Validation`, `Interactions_Frontend_Handler`.
- Editor: `packages/packages/core/editor-interactions/` — `InteractionsTab`, controls registry, preview via `editor-interactions.js`.
- Frontend: `modules/interactions/assets/js/interactions.js` (Motion.js); subset of schema triggers/effects at runtime.
- Pro fields: PHP PropTypes use `->meta( 'pro', … )` with `Presets::ADDITIONAL_*`; editor Pro unlocks via companion package in elementor-pro repo.

## Runtime subset (do not over-promise)

Frontend `isSupportedInteraction()` allows triggers `load`, `scrollIn`, `scrollOut` and rejects `custom` effects; `hover`, `click`, `scrollOn` are skipped. Preset effects `fade`/`slide`/`scale` render via `getKeyframes()` — not validated in `isSupportedInteraction()`. Core free editor registers `trigger: load|scrollIn` only.

## See also

- [interactions/overview.md](../../../docs/atomic-builder/interactions/overview.md)
- [extend-editor-v2](../extend-editor-v2/SKILL.md) — package + `init()` patterns
- [migration/prop-type-migrations.md](../../../docs/atomic-builder/migration/prop-type-migrations.md)
