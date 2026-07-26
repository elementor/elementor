# Variables overview

> Audience: both
> Module: `modules/variables/` · `packages/packages/core/editor-variables/`
> Status: draft
> Related: [types.md](./types.md), [usage-in-props.md](./usage-in-props.md), [../getting-started/experiments.md](../getting-started/experiments.md)

## What it is

**Global variables** are kit-scoped design tokens for v4 atomic editing. Each variable has a **label** (the public CSS name), an internal **id** (`e-gv-*`), a **type** (color, font, size), and a plain CSS **value**.

At render time the module outputs kit CSS on `:root`:

```css
:root { --wc26-gold:#C6A15B; --font-heading:"Playfair Display"; }
```

Consumers reference tokens by **label**, not id: `var(--wc26-gold)`, not `var(--e-gv-wc26-gold)`.

Variables are distinct from legacy v3 Site Settings globals. Color variables may optionally sync to v3 global colors (`sync_to_v3`).

## When to use it

- Define a reusable palette, typography stack, or spacing scale for the active kit.
- Bind style props to tokens (typed PropValues) instead of hard-coded literals.
- Reference tokens in raw CSS (`custom_css`) when a style key has no typed control.
- Let agents discover and mutate tokens via REST or MCP before composing styles.

## Key concepts

| Concept | Detail |
|---------|--------|
| Kit scope | Stored on the active kit as post meta `_elementor_global_variables` (`Storage\Constants::VARIABLES_META_KEY`). |
| Label vs id | **Label** is the author-facing identifier and CSS custom-property name. **Id** (`e-gv-*`) is internal storage and PropValue `value`. |
| Watermark | Optimistic-concurrency integer returned by REST/MCP; required for batch writes. |
| Limit | Up to 1,000 variables per kit (`Constants::TOTAL_VARIABLES_COUNT`). |
| Experiments | `e_variables` gates the PHP module; requires `e_atomic_elements`. `e_variables_manager` gates the spreadsheet-style manager UI in the editor only (JS check; no separate PHP module gate). |
| JS package | `editor-variables` registers via `elementor/editor/v2/packages`. |

### Experiments

| Experiment | Constant | Depends on | Default |
|------------|----------|------------|---------|
| Variables | `e_variables` | `e_atomic_elements` | active (alpha, hidden) |
| Variables Manager | `e_variables_manager` | `e_variables` | active (alpha, hidden) |

Both are registered in `modules/variables/module.php`. The module constructor exits early when `e_variables` or atomic widgets is inactive.

> **Experiment lifecycle:** `e_variables` (~1 year default-active, alpha) and `e_variables_manager` (~9 months, alpha) are candidates to fold into v4 permanently — tracked in [ED-25066](https://elementor.atlassian.net/browse/ED-25066). Until that ticket is resolved, the flags remain in code and docs should treat them as experiment-gated even though most sites have them on.

## Extension

Register new variable **types** on the `elementor/variables/register` hook — see [types.md](./types.md). That registry is the primary extension surface; built-in color/font/size types are examples of it, not a closed list.

Editor UI for a new type also requires `registerVariableType()` in `editor-variables` (see [types.md](./types.md#editor-side-js)).

## Internals

| Piece | Path |
|-------|------|
| Module bootstrap | `modules/variables/module.php` — init registry on `init`, enqueue quota config |
| Hooks wiring | `modules/variables/hooks.php` — REST, CSS renderer, style-schema augmentation, built-in type registration |
| Storage | `modules/variables/storage/` — `Variables_Repository`, `Variable` entity, batch processor |
| CSS output | `modules/variables/classes/css-renderer.php` — `:root` block appended on kit CSS parse |
| Style unions | `classes/style-schema.php`, `classes/size-style-schema.php` — add variable prop types to atomic style schema |
| Transform | `transformers/global-variable-transformer.php` — resolves id → `var(--label)` |
| Import/export | `import-export-customization/` — kit file `global-variables.json` |

Quota config (color/font limits for promotions) is inlined in `enqueue_editor_scripts()` as `window.ElementorVariablesQuotaConfig`.

## See also

- [types.md](./types.md) — registration-first type guide
- [usage-in-props.md](./usage-in-props.md) — PropValue binding
- [usage-in-styles.md](./usage-in-styles.md) — raw CSS usage
- [api.md](./api.md) — REST and MCP
- [../architecture/packages-map.md](../architecture/packages-map.md) — PHP ↔ JS mapping
