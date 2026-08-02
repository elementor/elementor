# Variables in PropValues

> Audience: both
> Module: `modules/variables/prop-types/`, `modules/atomic-widgets/props-resolver/`
> Status: final
> Related: [../fundamentals/prop-value.md](../fundamentals/prop-value.md), [types.md](./types.md), [usage-in-styles.md](./usage-in-styles.md)

## What it is

When a style control supports variables, the saved value is a **PropValue** whose `$$type` is a global-variable key and whose `value` is the variable's **internal id** (not the label). At render time, color and font bindings are resolved by PHP `Global_Variable_Transformer` to `var(--label)`; size bindings resolve in the editor via JS `variableTransformer` (see [Resolution pipeline](#resolution-pipeline)).

Example — color on a style variant:

```json
{
  "$$type": "global-color-variable",
  "value": "e-gv-abc123"
}
```

The editor displays the human label (`wc26-gold`); generated CSS uses `var(--wc26-gold)`.

## When to use it

- Bind atomic style props (color, font-family, size, etc.) to kit tokens through the variables popover.
- Serialize element or global-class styles that should update when a token value changes.
- Let the CSS converter promote `var(--label)` literals into typed bindings during MCP composition.

Prefer PropValue binding over raw `var(--label)` in `custom_css` when the style schema exposes a variable union on that key — see [usage-in-styles.md](./usage-in-styles.md).

## Key concepts

### Variable prop type keys

| `$$type` | Binds to | Stored `value` | Rendered as |
|----------|----------|----------------|---------------|
| `global-color-variable` | Color style keys (via `Style_Schema`) | Variable id | `var(--label)` |
| `global-font-variable` | `font-family` union | Variable id | `var(--label)` |
| `global-size-variable` | Size style keys (Pro; via `Size_Style_Schema`) | Variable id | `var(--label, fallback)` in editor; not resolved in PHP CSS today |
| `global-custom-size-variable` | Complex size expressions (Pro) | Variable id | Same as size (editor JS only for PropValue resolution) |

PHP classes: `modules/variables/prop-types/{color,font,size}-variable-prop-type.php`. JS utils: `packages/packages/core/editor-variables/src/prop-types/`.

### Style schema unions

`Style_Schema` walks atomic style prop types and adds variable unions:

- `Color_Prop_Type` → also accepts `global-color-variable`
- `font-family` → also accepts `global-font-variable`

`Size_Style_Schema` adds `global-size-variable` to eligible `Size_Prop_Type` keys (skips angle/time units; grid-track sizes need Pro ≥ 4.2).

Filter: `elementor/atomic-widgets/styles/schema`.

### Resolution pipeline

1. Style variant stores PropValue with id in `value`.
2. **PHP (frontend CSS):** `Style_Transformers` registers `Global_Variable_Transformer` for `global-color-variable` and `global-font-variable` only (`classes/style-transformers.php`). The transformer loads the variable by id via `Variables::by_id()` and returns `var(--{label})`; deleted variables fall back to `var(--{id})`. `global-size-variable` / `global-custom-size-variable` are **not** registered on `elementor/atomic-widgets/styles/transformers/register` — `Render_Props_Resolver` returns `null` for unregistered `$$type` keys, so size bindings do not resolve in server-generated CSS today. (`Global_Variable_Transformer` includes grid-track `repeat()` logic and is unit-tested for it, but that path is not wired for size keys in `Style_Transformers`.)
3. **JS (editor canvas):** `registerVariableType()` auto-registers `variableTransformer` (`packages/packages/core/editor-variables/src/transformers/variable-transformer.ts`) for every type, including size. Output is `var(--label, fallback)` (or `repeat(n, 1fr)` on grid-track keys).

### Editor binding UX

`editor-variables` replaces controls when a variable PropValue is assigned (`init.ts` → `registerControlReplacement`). The variables popover (`registerPopoverAction`) creates or assigns tokens. `extractVariablesFromStyleValue()` discovers bindings for usage tracking.

## Extension

1. Register the type on `elementor/variables/register` ([types.md](./types.md)).
2. Augment `elementor/atomic-widgets/styles/schema` so target keys union your prop type.
3. Register a transformer on `elementor/atomic-widgets/styles/transformers/register` (mirror `Style_Transformers::append_to()`).
4. Add `registerVariableType()` in `editor-variables` with matching `propTypeUtil.key`.

REST and MCP accept any registered type key for create operations.

## Internals

| Component | Path |
|-----------|------|
| Transformer | `modules/variables/transformers/global-variable-transformer.php` |
| Runtime lookup | `modules/variables/classes/variables.php` — populated before style render |
| Storage encoding | `adapters/prop-type-adapter.php` — size values as PropValue objects in DB |
| Variable control | `packages/.../controls/variable-control.tsx` |
| Bound prop hook | `hooks/use-variable-bound-prop.ts` |

PropValue `value` holds the id because labels can be renamed; ids are stable for storage. MCP update operations require both `id` and current `label`.

## See also

- [types.md](./types.md) — register new variable types
- [usage-in-styles.md](./usage-in-styles.md) — raw CSS alternative
- [../fundamentals/style-schema.md](../fundamentals/style-schema.md) — canonical style keys
- [../fundamentals/transformers.md](../fundamentals/transformers.md) — transformer registry contexts
- [../global-classes/applying-classes.md](../global-classes/applying-classes.md) — classes using variable-bound props
