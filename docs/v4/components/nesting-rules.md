# Component nesting rules

> Audience: internal
> Module: `modules/components/circular-dependency-validator.php`, `modules/components/component-lock-manager.php`, `modules/atomic-widgets/utils/format-element-ids.php`
> Status: draft
> Related: [overview.md](./overview.md), [instances-and-overrides.md](./instances-and-overrides.md), [../global-classes/applying-classes.md](../global-classes/applying-classes.md)

## What it is

Internal constraints that govern how components compose: preventing circular references, coordinating concurrent edits via locks, scoping nested element IDs per instance, and extending global classes to component documents.

## When to use it

- Debug "can't nest" errors during save or drag-and-drop.
- Trace duplicate-ID issues when multiple instances of the same component appear on one page.
- Understand why global classes work inside component source documents.

## Key concepts

### Circular dependency validator

`Circular_Dependency_Validator` runs in two places:

1. **PHP — on component document save** (`elementor/document/before_save`, only for `Component` documents). Throws if the component's element tree would create a cycle.
2. **PHP — on batch create** (`Components_REST_API::create_components` / `create_validate_components`) via `validate_new_components()`, which handles unsaved UIDs before numeric IDs exist.
3. **JS — editor commands** (`prevent-circular-nesting.ts`) blocks `document/elements/create`, `move`, and `paste` when the operation would nest a component inside itself or inside an ancestor on the editing path.

Algorithm (PHP):

1. Collect inner component IDs from `e-component` widgets (`component_instance.value.component_id`).
2. Reject if the component references itself directly.
3. For each nested component, recursively check whether it eventually contains the parent (`is_component_eventually_contains`). Max depth: 50 (`MAX_RECURSION_DEPTH`).

The JS `wouldCreateCircularNesting()` check is **direct-path only** (current component id + editing path stack); the PHP validator covers the full transitive graph on save.

Error message (user-facing): *"Can't add this component - components that contain each other can't be nested."*

### Lock manager

Two classes share locking logic:

| Class | Lock duration | Scope |
|-------|---------------|-------|
| `Document_Lock_Manager` | 5 minutes (default) | Base implementation |
| `Component_Lock_Manager` | 1 hour (`ONE_HOUR`) | Component posts only |

`Component_Lock_Manager` extends the base manager and stores lock state in post meta:

| Meta key | Purpose |
|----------|---------|
| `_lock_user` | User ID holding the lock |
| `_lock_time` | Lock timestamp |
| `_edit_lock` | WordPress native edit lock (via `wp_set_post_lock`) |

Operations: `lock()`, `unlock()`, `extend_lock()`, `get_lock_data()`, `is_lock_expired()`. Only posts where `get_post_type() === 'elementor_component'` are accepted.

The lock manager registers a `heartbeat_received` handler to extend locks for the current holder. REST endpoints (`/components/lock`, `/unlock`, `/lock-status`) expose lock state to the editor; `can_lock()` requires Pro or expired license.

### Nested element ID formatting

When a component instance renders, inner element IDs must be unique per instance on the page. Both PHP and JS apply the same algorithm:

1. Walk the component's element tree.
2. Build a **nesting path**: `[instance_element_id, …, parent_origin_id, current_origin_id]`.
3. Replace `id` with `hashString(path.join('_'), 7)` — a djb2 hash rendered as 7-character base-36 lowercase.
4. Store the original id in `origin_id` (PHP: `origin_id`; JS: `originId`).

PHP: `Format_Element_Ids::format()` (aliased as `Format_Component_Elements_Id`).
JS: `formatComponentElementsId()` in `editor-components`.

The hash implementation is kept in sync between `modules/atomic-widgets/utils/format-element-ids.php` and `@elementor/utils` (`hashString`).

This formatting runs in:

- `Component_Instance_Transformer` (frontend render)
- `Component_Instance::get_inner_elements_data_for_search()` (editor search)
- `createComponentType` render path (editor canvas preview)

### Global classes on component documents

The components module registers:

```php
add_filter(
  'elementor/global_classes/additional_post_types',
  fn( $post_types ) => array_merge( $post_types, [ Component_Document::TYPE ] )
);
```

This adds `elementor_component` to the post types where global classes are available. Elements inside a component source document can use the `classes` prop with kit-scoped global class labels. The `classes` prop is excluded from overridable wrapping (`Overridable_Schema_Extender` skips it via `Atomic_Elements_Utils::is_classes_prop()`).

Instance-level class overrides follow the normal override path if a `classes` prop were exposed — but by design, `classes` is not wrapped as overridable.

## Extension

N/A — nesting rules are enforced internally. No filter allows bypassing circular-dependency validation.

## Internals

- **Render-time cycle guard:** `Component_Instance_Transformer` maintains a static `$rendering_stack`; if a component id is already being rendered, it returns empty string instead of recursing infinitely.
- **Non-atomic validator:** `Non_Atomic_Widget_Validator` rejects component creation containing legacy widgets (separate from circular checks).
- **Editing path:** the JS store tracks `currentComponentId` and `path` (stack of nested component contexts) for direct nesting checks during embedded-document editing.

## See also

- [overview.md](./overview.md) — composition overview
- [document-model.md](./document-model.md) — REST lock endpoints
- [instances-and-overrides.md](./instances-and-overrides.md) — instance rendering pipeline
- [../global-classes/data-model.md](../global-classes/data-model.md) — global classes storage model
