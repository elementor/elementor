# Component nesting rules

> Audience: internal
> Module: `modules/components/circular-dependency-validator.php`, `modules/components/component-lock-manager.php`, `modules/atomic-widgets/utils/format-element-ids.php`
> Related: [overview.md](./overview.md), [instances-and-overrides.md](./instances-and-overrides.md), [../global-classes/applying-classes.md](../global-classes/applying-classes.md)

## What it is

Constraints governing component composition: circular-reference prevention, concurrent edit locks, per-instance element ID scoping, and global-classes support in component documents.

## When to use it

- Debug "can't nest" errors during save or drag-and-drop.
- Trace duplicate-ID issues with multiple instances on one page.
- Understand global classes inside component source documents.

## Key concepts

### Circular dependency validator

`Circular_Dependency_Validator` runs:

1. **PHP save** — `elementor/document/before_save` on `Component` documents.
2. **PHP batch create** — `Components_REST_API` via `validate_new_components()` (handles unsaved UIDs).
3. **JS commands** — `prevent-circular-nesting.ts` blocks `document/elements/create`, `move`, `paste`.

Algorithm: collect inner `component_id` values from `e-component` widgets → reject self-reference → recursively check transitive containment (`is_component_eventually_contains`). Max depth: 50.

JS `wouldCreateCircularNesting()` is direct-path only; PHP covers full graph on save.

Error: *"Can't add this component - components that contain each other can't be nested."*

### Lock manager

| Class | Lock duration | Scope |
|-------|---------------|-------|
| `Document_Lock_Manager` | 5 minutes | Base |
| `Component_Lock_Manager` | 1 hour | Component posts only |

Meta keys: `_lock_user`, `_lock_time`, `_edit_lock`.

Operations: `lock()`, `unlock()`, `extend_lock()`, `get_lock_data()`. REST: `/components/lock`, `/unlock`, `/lock-status`. `can_lock()` requires Pro or expired license.

### Nested element ID formatting

When an instance renders, inner IDs must be unique per instance:

1. Walk element tree.
2. Build nesting path: `[instance_element_id, …, parent_origin_id, current_origin_id]`.
3. Replace `id` with `hashString( path.join( '_' ), 7 )` (djb2, base-36).
4. Store original in `origin_id` (PHP) / `originId` (JS).

PHP: `Format_Component_Elements_Id::format()`. JS: `formatComponentElementsId()` (package-internal).

Runs in `Component_Instance_Transformer`, editor search, and canvas preview.

### Global classes on component documents

```php
add_filter( 'elementor/global_classes/additional_post_types',
  fn( $types ) => array_merge( $types, [ Component_Document::TYPE ] )
);
```

`classes` prop is excluded from overridable wrapping.

## Extension

N/A — no filter bypasses circular-dependency validation.

## Public API

| Symbol | Signature | Purpose | Source |
|--------|-----------|---------|--------|
| `Circular_Dependency_Validator` | `::make()`, `validate( $id, $elements, $unsaved = [] )` | Full-graph cycle check | `circular-dependency-validator.php` |
| `Circular_Dependency_Validator` | `validate_new_components( Collection $items )` | Batch create validation | `circular-dependency-validator.php` |
| `Component_Lock_Manager` | `lock( $post_id )`, `unlock( $post_id )`, `get_lock_data( $post_id )` | Edit locks | `component-lock-manager.php` |
| `Format_Component_Elements_Id` | extends `Format_Element_Ids` | PHP ID hashing | `utils/format-component-elements-id.php` |
| `wouldCreateCircularNesting` | `( componentIdToAdd )` | JS direct-path check | `editor-components/src/prevent-circular-nesting.ts` |
| `Non_Atomic_Widget_Validator` | validates element tree | Rejects legacy widgets | `non-atomic-widget-validator.php` |

## Internals

- **Render-time guard** — `Component_Instance_Transformer::$rendering_stack` returns empty string on re-entry.
- **Editing path** — JS store tracks `currentComponentId` and `path` for embedded-document checks.

## See also

- [overview.md](./overview.md) — composition overview
- [document-model.md](./document-model.md) — REST lock endpoints
- [instances-and-overrides.md](./instances-and-overrides.md) — rendering pipeline
- [../global-classes/data-model.md](../global-classes/data-model.md) — global classes storage
