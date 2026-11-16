# Component document model

> Audience: both
> Module: `modules/components/documents/component.php`, `modules/components/components-repository.php`, `modules/components/components-rest-api.php`
> Related: [overview.md](./overview.md), [instances-and-overrides.md](./instances-and-overrides.md), [../global-classes/data-model.md](../global-classes/data-model.md)

## What it is

A component is an Elementor document backed by CPT `elementor_component`. Class `Elementor\Modules\Components\Documents\Component` stores the element tree, overridable-props metadata, and lifecycle flags.

## When to use it

- Query or create components via `Components_Repository`.
- Integrate with REST under `elementor/v1/components`.
- Understand where overridable props and UIDs persist.

## Key concepts

### CPT and document type

| Constant | Value |
|----------|-------|
| `Component::TYPE` | `elementor_component` |

Supported features: `title`, `author`, `thumbnail`, `custom-fields`, `revisions`, `elementor`.

### Meta keys

| Meta key | Purpose |
|----------|---------|
| `_elementor_component_uid` | Stable UID at creation |
| `_elementor_component_overridable_props` | JSON map of exposed props |
| `_elementor_component_is_archived` | Archive flag |
| `_elementor_component_archived_at` | Archive timestamp |

Overridable props also written from `settings.overridable_props` on save (requires `can_edit()`).

### Kit limit

`Components_REST_API::MAX_COMPONENTS` = **100** non-archived components. `all()` query uses same cap.

### REST API

Namespace: `elementor/v1/components`.

| Route | Method | Purpose |
|-------|--------|---------|
| `/components` | GET | List |
| `/components` | POST | Batch create (Pro) |
| `/components/create-validate` | POST | Validate without persisting |
| `/components/styles` | GET | Styles map by component id |
| `/components/overridable-props` | GET | Overridable props for `componentIds` |
| `/components/status` | PUT | Publish |
| `/components/lock` | POST | Acquire edit lock |
| `/components/unlock` | POST | Release lock |
| `/components/lock-status` | GET | Check lock |
| `/components/archive` | POST | Archive |
| `/components/update-titles` | POST | Batch rename |

Creation runs `Save_Components_Validator`, `Circular_Dependency_Validator`, `Non_Atomic_Widget_Validator`.

## Extension

Use `Components_Repository::make()` for server-side CRUD. Mutating REST routes require `manage_options`; reads require `edit_posts`. No alternate storage backend filter.

## Public API

| Symbol | Signature | Purpose | Source |
|--------|-----------|---------|--------|
| `Components_Repository` | `::make()` | Factory | `components-repository.php` |
| `Components_Repository` | `all(): Collection` | List up to 100 components | `components-repository.php` |
| `Components_Repository` | `get( $id, $include_autosave = true )` | Get document or null | `components-repository.php` |
| `Components_Repository` | `create( $title, $content, $status, $uid, $settings = [] )` | Create + save | `components-repository.php` |
| `Components_Repository` | `publish_component( Component $component ): bool` | Publish (merge autosave) | `components-repository.php` |
| `Components_Repository` | `archive( array $ids, string $status )` | Soft-archive | `components-repository.php` |
| `Components_Repository` | `update_title( int $id, string $title, string $status ): bool` | Rename | `components-repository.php` |
| `Component` | `::TYPE`, `::COMPONENT_UID_META_KEY`, `::OVERRIDABLE_PROPS_META_KEY` | Document constants | `documents/component.php` |
| `Component` | `get_component_uid()`, `get_overridable_props()`, `archive()`, `update_title()` | Document methods | `documents/component.php` |
| `Components_REST_API` | `::API_NAMESPACE`, `::API_BASE`, `::MAX_COMPONENTS` | REST constants | `components-rest-api.php` |

## Internals

- **Global classes** — `elementor/global_classes/additional_post_types` includes `elementor_component`.
- **Post-render styles** — `Component_Styles` tracks related post IDs for CSS cache invalidation.
- **Migration** — `elementor/document/after_migrate` calls `align_overridable_props_with_elements()`.

## See also

- [overview.md](./overview.md) — feature overview
- [instances-and-overrides.md](./instances-and-overrides.md) — overridable prop shape
- [nesting-rules.md](./nesting-rules.md) — lock endpoints
- [../fundamentals/prop-value.md](../fundamentals/prop-value.md) — PropValue conventions
