---
name: internal-extend-interactions
description: "Internal: Extend v4 interactions end-to-end in a Core fork and submit a Core PR. Editor APIs exist externally; published-page runtime has no public hook."
---

# Extend interactions

> **Scope: Internal** — the full documented outcome includes published-page behavior and **no public frontend registration hook** exists. New triggers/effects require a PR against Elementor Core (`interactions.js` / `interactions-utils.js`). Editor APIs can be called from a third-party plugin, but that is **editor-only partial integration** and does **not** satisfy this skill. Full split + disclaimer: [skills-scope.md](../../../docs/atomic-builder/skills-scope.md).

## Implementation location

- **Fork/clone** [elementor/elementor](https://github.com/elementor/elementor).
- **PHP + published-page frontend runtime (Core):** `modules/interactions/` — `Interactions_Schema`, `Presets`, `Validation`, `Interactions_Frontend_Handler`, `assets/js/interactions.js`, `assets/js/interactions-utils.js`, `props/`.
- **Editor (Core):** `packages/packages/core/editor-interactions/` — `InteractionsTab`, controls registry, preview via `editor-interactions.js`. Edit **`editor-interactions` package `init()` in Core**, not a third-party plugin, for full-stack outcomes.
- **Pro companion only:** elementor-pro repo — Pro-gated `registerInteractionsControl` options; **full core runtime belongs in Core**.
- **Skill fixture (boundary demo):** `tests/phpunit/elementor/modules/interactions/test-skill-fixture-runtime-boundary.php` — stored `click` passes PHP validation but is outside frontend runtime subset.
- **Submit PR against Core.**

Read first: [interactions/editor.md](../../../docs/atomic-builder/interactions/editor.md), [interactions/schema.md](../../../docs/atomic-builder/interactions/schema.md), [interactions/frontend.md](../../../docs/atomic-builder/interactions/frontend.md). Example: [docs/atomic-builder/examples/internal-extend-interactions.md](../../../docs/atomic-builder/examples/internal-extend-interactions.md). Gate: experiment `e_atomic_elements`.

## Checklist (Internal-first — Core PR path)

1. **Understand data model** — `interactions` prop: `version` + `items[]` of `interaction-item` PropValues. See [schema.md](../../../docs/atomic-builder/interactions/schema.md).
2. **PHP (Core)** — extend `Presets`, `Validation`, prop types under `modules/interactions/props/` when allowed values or shape change. Filter `elementor/atomic-widgets/interactions/schema` alone is insufficient for full outcome.
3. **Editor (Core package)** — `registerInteractionsControl( { type, component, options? } )` in **`packages/packages/core/editor-interactions/src/init.ts`**; options must match `Presets` enums.
4. **Editor preview (Core)** — update `editor-interactions.js` preview path when trigger/effect behavior changes — [interactions/editor.md](../../../docs/atomic-builder/interactions/editor.md).
5. **Frontend runtime (Core PR required)** — extend `isSupportedInteraction()` and `getKeyframes()` in `interactions-utils.js`; trigger handling in `interactions.js`. **No public WordPress hook.**
6. **Sync all layers** when allowed values change — PHP `Validation` + `Presets`, PropType `meta('pro', …)`, editor control options, editor support checks, frontend support checks.
7. **Prop-type migrations** — if stored shape changes, follow [migration/prop-type-migrations.md](../../../docs/atomic-builder/migration/prop-type-migrations.md) (`interactions` → `items`).
8. **PHPUnit** — extend `tests/phpunit/elementor/modules/interactions/` (see existing `test-validation.php`, `test-parser.php`). Fast loop: `tests/phpunit/run-unit.sh tests/phpunit/.../test-*.php`.
9. **MCP (optional)** — update interactions MCP schema resource when enums/shape change — [mcp/abilities/interactions-schema-resource.md](../../../docs/atomic-builder/mcp/abilities/interactions-schema-resource.md).

## External partial APIs (do not satisfy this skill)

- Filter `elementor/atomic-widgets/interactions/schema` for new stored fields.
- Third-party editor v2 package: `registerInteractionsControl`, `interactionsRepository.register` in **your** plugin `init()`.
- **Cannot** add new Motion.js effects on the live site without Core changes to `interactions.js` / `interactions-utils.js`.

## Runtime subset (do not over-promise)

Frontend `isSupportedInteraction()` allows triggers `load`, `scrollIn`, `scrollOut` and rejects `custom` effects; `hover`, `click`, `scrollOn` are skipped at runtime even when stored/validated. Preset effects `fade`/`slide`/`scale` render via `getKeyframes()`. Core free editor registers `trigger: load|scrollIn` only; Pro unlocks additional triggers via elementor-pro companion.

Editor-only `isSupportedInteractionItem()` is driven by `registerInteractionsControl` options — documented primarily in the example doc, not primary interactions pages.

## See also

- [interactions/overview.md](../../../docs/atomic-builder/interactions/overview.md)
- [add-editor-package](../add-editor-package/SKILL.md) — editor-only partial path in a third-party plugin
