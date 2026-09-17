---
name: add-dynamic-tag
description: "External: Add dynamic tags for v4 atomic widgets from a third-party plugin. elementor/dynamic_tags/register, tag categories, PropValue unions, select filters."
---

# Add dynamic tag

> **Scope: External** — the full documented outcome is shippable from a 3rd-party plugin via `elementor/dynamic_tags/register` and the atomic select-control filters; no Core changes required. There is no public filter for category→schema auto-mapping — custom mapping needs manual prop unions. Full split + disclaimer: [skills-scope.md](../../../docs/atomic-builder/skills-scope.md).

## Implementation location

- **PHP:** existing or new **third-party plugin repository**; plugin-owned `Tag` subclasses and registration (e.g. `MyPlugin\Tags\`).
- **Do not modify Elementor Core.** Bridge internals live in `modules/atomic-widgets/dynamic-tags/` — reference only.
- **Runnable reference:** [examples/example-plugin/](../../../examples/example-plugin/) (`Site_Name_Tag` with group, controls, render).

## Prerequisites

- Experiment `e_atomic_elements` active — see [getting-started/experiments.md](../../../docs/atomic-builder/getting-started/experiments.md).

Read first: [dynamic-tags/extending.md](../../../docs/atomic-builder/dynamic-tags/extending.md). Supporting: [overview.md](../../../docs/atomic-builder/dynamic-tags/overview.md), [binding-propvalues.md](../../../docs/atomic-builder/dynamic-tags/binding-propvalues.md), [discovery.md](../../../docs/atomic-builder/dynamic-tags/discovery.md).

## Checklist

1. **Register legacy v3 tag** (required bridge entry point)

```php
add_action( 'elementor/dynamic_tags/register', function ( $manager ) {
    $manager->register( new \MyPlugin\Tags\Store_Hours() );
} );
```

2. **Tag class** — extend `\Elementor\Core\DynamicTags\Tag`; `get_name()`, `get_title()`, `get_group()`, `get_categories()` using `\Elementor\Modules\DynamicTags\Module::TEXT_CATEGORY`, `URL_CATEGORY`, etc. **`register_controls()` is required** when the tag has per-tag settings in the atomic editor. Control `type`: prefer plain strings (`'text'`, `'select'`) as in docs; `\Elementor\Controls_Manager::TEXT` etc. are equivalent (`includes/managers/controls.php`). Implement `render()`. Convertible controls: `text`, `textarea`, `select`, `number`, `switcher`, `choose`, `query`, `date_time`, `media`. Example: [docs/atomic-builder/examples/add-dynamic-tag.md](../../../docs/atomic-builder/examples/add-dynamic-tag.md).
3. **Optional group** — `Plugin::$instance->dynamic_tags->register_group( 'my-plugin', [ 'title' => 'My Plugin' ] )`.
4. **Core auto-mapping (no plugin work)** — For standard tags (e.g. `TEXT_CATEGORY` on a plain string prop), Core's `Dynamic_Prop_Types_Mapping` hooks `elementor/atomic-widgets/props-schema` and `elementor/atomic-widgets/styles/schema` internally (`dynamic-tags-module.php`) — **plugins do not register these hooks**. Plugin action is only needed for custom/non-standard prop types (step 6).
5. **Non-convertible controls** — override `get_editor_config()` with `force_convert_to_atomic => true` (unsupported controls skipped, not whole tag).
6. **Custom prop type** — add `Dynamic_Prop_Type::make()->categories( [ … ] )` to the union manually; narrow with `->allowed_tag_names()`; opt out with `->meta( Dynamic_Prop_Type::ignore() )`.
7. **Dynamic select options** — filters:
   - `elementor/atomic/dynamic-tags/select_control_options` — flat `options` on select controls
   - `elementor/atomic/dynamic-tags/select_control_groups` — same signature; for select controls that use `groups` (not flat `options`)
8. **Verify**
   - Tag discoverable via editor `atomicDynamicTags` and MCP/REST `list-dynamic-tags` — [discovery.md](../../../docs/atomic-builder/dynamic-tags/discovery.md).
   - Binding saves as `$$type: dynamic` with `name`, `group`, `settings`.
   - **Render/import/export:** Core registers `Dynamic_Transformer` and `ImportExport\Dynamic_Transformer` on transformer hooks — **plugins do not register these**; only register the legacy `Tag` (and optional manual prop unions).

## External implementation path

- Plugin owns `Tag` subclass + `elementor/dynamic_tags/register`.
- Custom atomic prop unions in own prop types — no public filter for category→schema mapping.
- Select option filters for dynamic picker UX.

## Core reference paths (do not edit)

- Bridge: `modules/atomic-widgets/dynamic-tags/` (`Dynamic_Prop_Types_Mapping`, `Dynamic_Tags_Converter`, `Dynamic_Transformer`).

## See also

- [create-atomic-widget](../create-atomic-widget/SKILL.md) — define props that accept dynamic bindings
- [fundamentals/transformers.md](../../../docs/atomic-builder/fundamentals/transformers.md) — `Dynamic_Transformer`
