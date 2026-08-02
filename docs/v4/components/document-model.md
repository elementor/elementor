# Component document model

> Audience: both
> Module: `modules/components/documents/component.php`, `modules/components/components-repository.php`, `modules/components/components-rest-api.php`
> Status: final
> Related: [overview.md](./overview.md), [instances-and-overrides.md](./instances-and-overrides.md), [../global-classes/data-model.md](../global-classes/data-model.md)

## What it is

A component is an Elementor document backed by a dedicated WordPress custom post type. The document class `Elementor\Modules\Components\Documents\Component` extends the core `Document` base and stores the component's element tree, overridable-props metadata, and lifecycle flags (archive, UID).

## When to use it

- Query or create component documents programmatically via `Components_Repository`.
- Integrate with REST endpoints under `elementor/v1/components`.
- Understand where overridable props and component UIDs are persisted.

## Key concepts

### CPT and document type

Both the WordPress post type and the Elementor document type use the same slug, defined as a constant on the document class:

| Constant | Value |
|----------|-------|
| `Component::TYPE` | `elementor_component` |

Registration (verified in `modules/components/module.php`):

```php
register_post_type( Component_Document::TYPE, [ /* ... */ ] );
$documents_manager->register_document_type( Component_Document::TYPE, Component_Document::class );
```

Supported post features: `title`, `author`, `thumbnail`, `custom-fields`, `revisions`, `elementor`.

### Meta keys

| Meta key | Purpose |
|----------|---------|
| `_elementor_component_uid` | Stable UID assigned at creation |
| `_elementor_component_overridable_props` | JSON map of exposed props (override keys, labels, origin values, groups) |
| `_elementor_component_is_archived` | Archive flag |
| `_elementor_component_archived_at` | Archive timestamp |

Overridable props are also written on save from `settings.overridable_props` in the document save payload (requires `can_edit()` permission).

### Repository

`Components_Repository` is the primary PHP API:

| Method | Behavior |
|--------|----------|
| `all()` | Lists up to 100 components (`MAX_COMPONENTS`) with id, title, uid, archive state, and extracted styles |
| `get( $id, $include_autosave )` | Returns a `Component` document or null |
| `create( $title, $content, $status, $uid, $settings )` | Creates and saves a new component; rolls back on failure |
| `publish_component( $component )` | Publishes main document, merging autosave if present |
| `archive( $ids, $status )` | Soft-archives components |
| `update_title( $id, $title, $status )` | Renames with autosave handling |

Draft/autosave workflow: when saving with `autosave` or `draft` status against a published component, the repository creates an autosave document for editing.

### Kit limit

`Components_REST_API::MAX_COMPONENTS` is **100**. This cap applies in two ways:

| Check | Behavior |
|-------|----------|
| Batch create / validate | `Save_Components_Validator` counts **non-archived** existing components plus new items; returns *"Maximum number of components exceeded."* when over 100 |
| `all()` listing | `get_posts()` uses `posts_per_page => MAX_COMPONENTS` — archived posts still consume a slot in the query window |

Archive components you no longer need to free capacity for new ones.

### REST API

Namespace: `elementor/v1/components` (`Components_REST_API::API_NAMESPACE` + `API_BASE`).

| Route | Method | Purpose |
|-------|--------|---------|
| `/components` | GET | List components |
| `/components` | POST | Batch create (Pro) |
| `/components/create-validate` | POST | Validate without persisting |
| `/components/styles` | GET | Styles map keyed by component id |
| `/components/overridable-props` | GET | Overridable props for given `componentIds` |
| `/components/status` | PUT | Publish components |
| `/components/lock` | POST | Acquire edit lock |
| `/components/unlock` | POST | Release edit lock |
| `/components/lock-status` | GET | Check lock state |
| `/components/archive` | POST | Archive components |
| `/components/update-titles` | POST | Batch rename |

Creation and validation run `Save_Components_Validator`, `Circular_Dependency_Validator`, and `Non_Atomic_Widget_Validator` before persisting.

## Extension

Use `Components_Repository::make()` for server-side CRUD. REST routes require `manage_options` for mutating operations and `edit_posts` for reads. Permission failures return `insufficient_permissions` with the current access tier in meta.

There is no public filter to register an alternate storage backend.

## Internals

- **Global classes:** the module hooks `elementor/global_classes/additional_post_types` to include `elementor_component`, so global classes can be applied to elements inside component documents. See [nesting-rules.md](./nesting-rules.md).
- **Post-render styles:** `Component_Styles` tracks related component post IDs for CSS cache invalidation via `elementor/document/related_posts`.
- **Migration:** `elementor/document/after_migrate` calls `align_overridable_props_with_elements()` on component documents to sync origin values after prop-type migrations.

## See also

- [overview.md](./overview.md) — feature overview and experiment gate
- [instances-and-overrides.md](./instances-and-overrides.md) — overridable prop shape
- [nesting-rules.md](./nesting-rules.md) — lock manager REST endpoints
- [../fundamentals/prop-value.md](../fundamentals/prop-value.md) — PropValue conventions
