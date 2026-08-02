# Applying Global Classes

> Audience: both
> Module: `modules/atomic-widgets/prop-types/classes-prop-type.php`, `modules/global-classes/atomic-global-styles.php`
> Status: final
> Related: [overview.md](./overview.md), [data-model.md](./data-model.md), [../mcp/composition-workflow.md](../mcp/composition-workflow.md)

## What it is

Atomic elements attach global classes through the **`classes` settings prop**, defined by `Classes_Prop_Type` (`get_key()` → `'classes'`). The prop holds an ordered array of class references; at rest these are **internal ids**, resolved to **labels** (CSS class names) during rendering.

```json
{
  "classes": {
    "$$type": "classes",
    "value": ["g-abc123", "g-def456"]
  }
}
```

(Internal ids shown intentionally — this is the on-disk element JSON shape.)

In author-facing documentation and MCP examples, show **labels** instead:

```json
{
  "classes": {
    "$$type": "classes",
    "value": ["wc26-gold", "hero-heading"]
  }
}
```

The `Classes_Prop_Type` validator accepts strings matching `/^[a-z][a-z-_0-9]*$/i`. A `Classes_Transformer` (registered in `modules/atomic-widgets/module.php`) runs on the settings resolution path and passes values through the `elementor/atomic-widgets/settings/transformers/classes` filter, which `Atomic_Global_Styles::transform_classes_names()` uses to map ids → labels.

## When to use it

- Attach one or more global classes to an atomic widget or element.
- Control cascade order among multiple global classes on the same element.
- Compose elements via MCP `build-composition` using the `classes` map (labels, not ids).
- Understand why local style overrides beat global class rules.

## Key concepts

### Prepend order

When global classes are applied programmatically (e.g. MCP `build-composition`), `Class_Applier::prepend_global_classes()` merges new class ids **before** any existing `classes` value:

```php
$merged = array_values( array_unique( array_merge( $class_ids, $existing ) ) );
```

Global classes therefore appear first in the stored array. In the editor, newly created global classes are also prepended to kit order (`store.ts` `add` reducer uses `unshift`).

Among global classes themselves, **kit order** determines CSS cascade: `Atomic_Global_Styles::get_document_global_styles()` intersects document-used ids with global order, then **reverses** for CSS emission — later entries in kit order win over earlier ones when the same property is set.

### Local styles win on conflict

Element-level **local styles** (`document-elements` styles provider, `priority: 50`) override **global classes** (`global-classes` provider, `priority: 30`). The styles repository sorts providers by descending priority; within the render pipeline, higher-priority providers produce rules that cascade over lower-priority ones.

Practical rule: global classes set the baseline; per-element local styles (label `"local"`) override conflicting properties.

### Validation rules

`Classes_Prop_Type` validates:

- Value must be an array of strings.
- Each entry must match `/^[a-z][a-z-_0-9]*$/i`.
- Empty strings are filtered out on sanitize.

Stored values are internal ids at save time; the editor's `resolveCssName` action (in `global-classes-styles-provider.ts`) and the PHP `transform_classes_names` filter convert them to labels for CSS output.

### MCP `classes` map

In `elementor/build-composition`, the `classes` parameter maps **configuration-id → label array**:

```json
{
  "classes": {
    "hero-heading": ["wc26-gold", "text-center"],
    "cta-button": ["btn-primary"]
  }
}
```

Rules (from `Class_Applier`):

- Keys must match `configuration-id` values in the XML structure.
- Values are **labels only** — internal `g-*` ids are rejected/unknown.
- Labels are resolved to internal ids and prepended into each element's `classes` prop.
- Unknown labels produce `elementor_unknown_global_class` with available labels listed.

Read available labels from resource `elementor://global-classes` before composing. Create missing classes first via `elementor/manage-classes`.

### Frontend CSS bundles

`Atomic_Global_Styles` registers per-document CSS via `Atomic_Styles_Manager` under key `['global', $post_id, $context]`. Only classes actually used on a document (tracked by `Global_Classes_Relations`) are included. Embedded posts (components/templates) aggregate into parent document bundles via `elementor/document/related_posts`.

## Extension

To expose `classes` on a custom atomic element, add to `define_props_schema()`:

```php
'classes' => Classes_Prop_Type::make()->default( [] ),
```

Some elements use variant prop names (`inner_classes`, `outer_classes`) with the same prop type. Register controls that bind to the `classes` key. See [../atomic-widgets/authoring-widgets.md](../atomic-widgets/authoring-widgets.md).

## Internals

**PHP render path:**

1. Element saved with `classes.value` = internal ids.
2. `Global_Classes_Relations` indexes usage on `elementor/document/after_save`.
3. `Atomic_Global_Styles` registers document CSS on `elementor/atomic-widgets/styles/register`.
4. `transform_classes_names` filter resolves ids → labels for HTML class attributes.

**JS editor path:**

1. `loadCurrentDocumentClasses()` fetches kit index + per-post styles via REST.
2. `globalClassesStylesProvider` serves definitions to the styles repository.
3. `createClassesTransformer()` in `editor-canvas` resolves ids → labels via `resolveCssName` for live preview.

**Import/export:** `Styles_Ids_Modifier` remaps class ids during template import when global class snapshots are present.

## See also

- [overview.md](./overview.md) — `Classes_Prop_Type` vs Global Classes module
- [data-model.md](./data-model.md) — label/id storage
- [api.md](./api.md) — REST and MCP APIs
- [../mcp/composition-workflow.md](../mcp/composition-workflow.md) — end-to-end agent composition
- [../mcp/abilities/build-composition.md](../mcp/abilities/build-composition.md) — `classes` parameter details
