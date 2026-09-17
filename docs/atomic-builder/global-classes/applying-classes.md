# Applying Global Classes

> Audience: both
> Module: `modules/atomic-widgets/prop-types/classes-prop-type.php`, `modules/global-classes/atomic-global-styles.php`
> Related: [overview.md](./overview.md), [data-model.md](./data-model.md), [../mcp/composition-workflow.md](../mcp/composition-workflow.md)

## What it is

Atomic elements attach global classes via the **`classes` settings prop** (`Classes_Prop_Type`, key `'classes'`). Stored values are **internal ids**; render resolves to **labels** (CSS class names).

On-disk shape:

```json
{
  "classes": {
    "$$type": "classes",
    "value": ["g-abc123", "g-def456"]
  }
}
```

Author-facing / MCP examples use **labels**:

```json
{ "classes": { "$$type": "classes", "value": ["wc26-gold", "hero-heading"] } }
```

`Classes_Transformer` + filter `elementor/atomic-widgets/settings/transformers/classes` maps ids → labels at render.

## When to use it

- Attach global classes to atomic elements
- Control cascade order among multiple classes
- Compose via MCP `build-composition` `classes` map (labels only)
- Understand local style override precedence

## Key concepts

### Prepend order

MCP `Class_Applier::prepend_global_classes()` merges new ids **before** existing values. Kit order determines CSS cascade among globals — later entries in kit order win.

### Local styles win

| Provider | Priority |
|----------|----------|
| Local styles (`document-elements`) | 50 |
| Global classes (`global-classes`) | 30 |

Per-element local styles override conflicting global class properties.

### Validation

`Classes_Prop_Type` accepts an array of strings matching `/^[a-z][a-z-_0-9]*$/i`.

### MCP `classes` map

In `elementor/build-composition`:

```json
{
  "classes": {
    "hero-heading": ["wc26-gold", "text-center"],
    "cta-button": ["btn-primary"]
  }
}
```

- Keys match `configuration-id` in XML structure
- Values are **labels only** (not `g-*` ids)
- Unknown labels → `elementor_unknown_global_class`

Read labels from `elementor://global-classes` before composing.

### Frontend CSS

`Atomic_Global_Styles` registers per-document CSS under `['global', $post_id, $context]`. Only classes used on the document are included.

## Public API

| Symbol | Signature | Purpose |
|--------|-----------|---------|
| `Classes_Prop_Type` | `public static function make(): static` | Add `classes` prop to schema |
| `Classes_Prop_Type` | `public static function get_key(): string` | Returns `'classes'` |
| `Atomic_Global_Styles` | hooks `elementor/atomic-widgets/styles/register` | Emits document global CSS |
| `globalClassesStylesProvider` | `resolveCssName` action (JS) | Editor id → label resolution |

Source: `modules/atomic-widgets/prop-types/classes-prop-type.php`, `atomic-global-styles.php`, `editor-global-classes/src/global-classes-styles-provider.ts`.

## Extension

```php
'classes' => Classes_Prop_Type::make()->default( [] ),
```

Some elements use variant names (`inner_classes`, `outer_classes`) with the same prop type.

## Internals

**PHP:** save → `Global_Classes_Relations` indexes usage → `Atomic_Global_Styles` registers CSS → `transform_classes_names` filter resolves ids.

**JS:** `loadCurrentDocumentClasses()` → `globalClassesStylesProvider` → `createClassesTransformer()` in editor-canvas.

## See also

- [overview.md](./overview.md)
- [data-model.md](./data-model.md)
- [api.md](./api.md)
- [../mcp/composition-workflow.md](../mcp/composition-workflow.md)
