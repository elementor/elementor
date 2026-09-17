# Variables in styles (raw CSS)

> Audience: both
> Module: `modules/atomic-widgets/styles/`, `modules/atomic-widgets/css-converter/`
> Related: [usage-in-props.md](./usage-in-props.md), [../css-converter/overview.md](../css-converter/overview.md), [api.md](./api.md)

## What it is

Variables can appear as CSS custom-property references in **raw CSS** — primarily per-variant `custom_css`, or declarations routed to `custom_css` when no typed prop exists.

```css
color: var(--wc26-gold);
padding-top: var(--spacing-md, 1rem);
font-family: var(--font-heading);
```

Kit renderer defines `--label` on `:root`. Use labels, never internal ids (`e-gv-*`).

## When to use it

- CSS property with no atomic style control or variable union
- Shorthands/combinations the typed schema does not model
- Agent/MCP `style` blocks using `var(--label)`

## Key concepts

### Label-only references

`Variables_Service::find_by_label_or_id()` resolves by label (case-insensitive) or id. MCP and CSS converter reject `var(--e-gv-label)`.

### Longhand preference

CSS converter promotes known properties to typed PropValues. Prefer longhand (`border-top-width`, `margin-top`) over shorthands so values bind to schema keys with variable unions.

When `var(--label)` matches a kit variable on a union-enabled key, `Variable_Prop_Value_Transformer` promotes to a `global-*-variable` PropValue. Unknown references stay in `custom_css`.

### Kit CSS output

```
:root { --wc26-gold:#C6A15B; --font-heading:Playfair Display; }
```

Deleted variables keep their id as the CSS name until restored.

### `custom_css` stripping

`Atomic_Widget_Styles::get_license_based_filtered_styles()` strips `custom_css` when Pro is inactive or Pro ≥ 3.35. Prefer typed variable PropValues over `custom_css`-only references for reliable frontend CSS.

## Public API

| Symbol | Signature | Purpose |
|--------|-----------|---------|
| `Variables_Service` | `public function find_by_label_or_id( string $needle ): ?array` | Resolve `var(--label)` reference |
| `Variable_Prop_Value_Transformer` | promotes `var(--label)` → PropValue | CSS converter path |
| `CSS_Renderer` | emits `:root` block | Kit CSS output (`classes/css-renderer.php`) |
| `extractVariablesFromStyleValue` (JS) | walks style props | Discover bound variables |

Source: `services/variables-service.php`, `css-converter/variable-prop-value-transformer.php`, `classes/css-renderer.php`, `editor-variables/src/utils/extract-variables-from-style-value.ts`.

## Extension

Prefer typed PropValue bindings ([usage-in-props.md](./usage-in-props.md)) or register variable types ([types.md](./types.md)). Raw `var(--label)` in `custom_css` is an escape hatch.

Filter `elementor/variables/css_entry_additional` for extra per-variable CSS.

## Internals

| Path | Behavior |
|------|----------|
| `variable-prop-value-transformer.php` | Promote or fall through to `custom_css` |
| `styles-renderer.php` | Append decoded `custom_css.raw` (base64) |
| `atomic-widget-styles.php` | License-gated `custom_css` stripping |

## See also

- [usage-in-props.md](./usage-in-props.md) — preferred typed binding
- [overview.md](./overview.md)
- [../css-converter/overview.md](../css-converter/overview.md)
- [../mcp/composition-workflow.md](../mcp/composition-workflow.md)
