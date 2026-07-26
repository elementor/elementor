# Variables in styles (raw CSS)

> Audience: both
> Module: `modules/atomic-widgets/styles/`, `modules/atomic-widgets/css-converter/`
> Status: draft
> Related: [usage-in-props.md](./usage-in-props.md), [../css-converter/overview.md](../css-converter/overview.md), [api.md](./api.md)

## What it is

Besides typed PropValue bindings, variables can appear as standard CSS custom-property references in **raw CSS** — primarily the per-variant `custom_css` field on atomic style variants, or declarations the CSS converter routes to `custom_css` when no typed prop exists.

Author-facing syntax uses the variable **label**:

```css
color: var(--wc26-gold);
padding-top: var(--spacing-md, 1rem);
font-family: var(--font-heading);
```

The kit renderer defines `--label` on `:root` (`classes/css-renderer.php`). References must use labels, never internal ids (`e-gv-*`).

## When to use it

- Apply a token to a CSS property that has no atomic style control (or no variable union on that key).
- Express shorthands or combinations the typed schema does not model — prefer **longhand** when the CSS converter can promote to typed props instead.
- Author agent/MCP `style` blocks in composition workflows using `var(--label)` after reading [elementor://global-variables](../mcp/resources.md).

## Key concepts

### Label-only references

`Variables_Service::find_by_label_or_id()` resolves by label (case-insensitive) or id. MCP and the CSS converter reject `var(--e-gv-label)` — always `var(--label)`. See `modules/mcp/abilities/build-composition/style-applier.php` and `css-converter` tests.

### Longhand preference

The CSS converter promotes known properties to typed PropValues. Prefer longhand declarations (`border-top-width`, `margin-top`) over shorthands (`border`, `margin`) so values can bind to schema keys with variable unions instead of landing in `custom_css`. See [../css-converter/extension.md](../css-converter/extension.md).

When a `var(--label)` matches a kit variable on a union-enabled key, `Variable_Prop_Value_Transformer` promotes it to a `global-*-variable` PropValue (id in `value`). Unknown or mis-prefixed references stay in `custom_css`.

### Kit CSS output

Active variables are emitted once per kit parse:

```
:root { --wc26-gold:#C6A15B; --font-heading:Playfair Display; }
```

Deleted variables keep their id as the CSS name until restored (`css-renderer.php`).

## Extension

Use typed PropValue bindings ([usage-in-props.md](./usage-in-props.md)) or register variable types ([types.md](./types.md)) so style keys accept unions — that is the durable path. Raw `var(--label)` in `custom_css` is an escape hatch, not the primary integration surface.

Filter `elementor/variables/css_entry_additional` to append extra CSS per variable entry if a type needs auxiliary declarations (e.g. `@font-face` is handled separately via `classes/fonts.php`).

## Internals

| Path | Behavior |
|------|----------|
| `css-converter/variable-prop-value-transformer.php` | Promotes `var(--label)` → PropValue; unresolved → `custom_css` |
| `atomic-widgets/styles/styles-renderer.php` | Appends decoded `custom_css.raw` (base64) to generated rules |
| `atomic-widgets/styles/atomic-widget-styles.php` | License-gated stripping (below) |
| `editor-variables/.../extract-variables-from-style-value.ts` | Walks style props to find bound variables |

### Pro 3.35+ `custom_css` stripping caveat

`Atomic_Widget_Styles::get_license_based_filtered_styles()` strips `custom_css` from style variants when:

- Elementor Pro is **not** active, **or**
- Elementor Pro version is **≥ 3.35**

When Pro is active but **&lt; 3.35**, `custom_css` is preserved in parsed post styles.

Stripping runs on frontend style parsing and when elements export raw editor data (`has-atomic-base.php`). Filter hook: `elementor/atomic_widgets/editor_data/element_styles` (second arg is unfiltered styles).

**Implication:** `var(--label)` declarations stored only in `custom_css` may not appear in cached frontend CSS on Pro ≥ 3.35 unless rendered through Pro's custom CSS path. Prefer typed variable PropValues or verify rendering for your target Pro version.

Source: `modules/atomic-widgets/styles/atomic-widget-styles.php` lines 94–104; tests in `tests/phpunit/.../test-custom-css-pro-restriction.php` (Pro ≥ 3.35 case currently `markTestSkipped`).

## See also

- [usage-in-props.md](./usage-in-props.md) — preferred typed binding
- [overview.md](./overview.md) — label vs id
- [../css-converter/overview.md](../css-converter/overview.md) — converter return shape `{ props, customCss, rejected }`
- [../mcp/composition-workflow.md](../mcp/composition-workflow.md) — agent styling with variables
