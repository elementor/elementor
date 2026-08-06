---
name: extend-dynamic-tags
description: Adds Elementor dynamic tags for v4 atomic widgets — elementor/dynamic_tags/register, tag categories, force_convert_to_atomic, Dynamic_Prop_Type unions, and atomic dynamic-tag select filters. Use for new data sources, dynamic PropValue bindings, or Dynamic_Prop_Types_Mapping.
---

# Extend dynamic tags (atomic bridge)

> **Scope: External** — shippable from a 3rd-party plugin via `elementor/dynamic_tags/register` and the atomic select-control filters; no Core changes required. There is no public filter for category→schema auto-mapping — custom mapping needs manual prop unions. Full split + disclaimer: [skills-scope.md](../../../docs/atomic-builder/skills-scope.md).

Read first: [dynamic-tags/extending.md](../../../docs/atomic-builder/dynamic-tags/extending.md). Supporting: [overview.md](../../../docs/atomic-builder/dynamic-tags/overview.md), [binding-propvalues.md](../../../docs/atomic-builder/dynamic-tags/binding-propvalues.md), [discovery.md](../../../docs/atomic-builder/dynamic-tags/discovery.md).

## Checklist

1. **Register legacy v3 tag** (required bridge entry point)

```php
add_action( 'elementor/dynamic_tags/register', function ( $manager ) {
    $manager->register( new \MyPlugin\Tags\Store_Hours() );
} );
```

2. **Tag class** — extend `\Elementor\Core\DynamicTags\Tag`; `get_name()`, `get_title()`, `get_group()`, `get_categories()` using `\Elementor\Modules\DynamicTags\Module::TEXT_CATEGORY`, `URL_CATEGORY`, etc. Convertible controls: `text`, `textarea`, `select`, `number`, `switcher`, `choose`, `query`, `date_time`, `media`. Example: [docs/atomic-builder/examples/extend-dynamic-tags.md](../../../docs/atomic-builder/examples/extend-dynamic-tags.md).
3. **Optional group** — `Plugin::$instance->dynamic_tags->register_group( 'my-plugin', [ 'title' => 'My Plugin' ] )`.
4. **Atomic auto-mapping** — `Dynamic_Prop_Types_Mapping` maps prop types to categories (e.g. `String_Prop_Type` → `TEXT_CATEGORY`), unions `Dynamic_Prop_Type`, sets `allowed_tag_names`. Hooks: `elementor/atomic-widgets/props-schema` (widget props) and `elementor/atomic-widgets/styles/schema` (color props only).
5. **Non-convertible controls** — override `get_editor_config()`:

```php
public function get_editor_config() {
    return array_merge( parent::get_editor_config(), [
        'force_convert_to_atomic' => true,
    ] );
}
```

6. **Custom prop type** — add `Dynamic_Prop_Type::make()->categories( [ … ] )` to the union manually; opt out with `->meta( Dynamic_Prop_Type::ignore() )`.
7. **Dynamic select options** — filters:
   - `elementor/atomic/dynamic-tags/select_control_options`
   - `elementor/atomic/dynamic-tags/select_control_groups`
8. **Verify** — tag in editor `atomicDynamicTags`; binding saves as `$$type: dynamic`; render via `Dynamic_Transformer` on `elementor/atomic-widgets/settings/transformers/register` and `styles/transformers/register`; import/export via `ImportExport\Dynamic_Transformer`.

## Public path

- Plugin owns `Tag` subclass + `elementor/dynamic_tags/register`.
- Custom atomic prop unions in own prop types — no public filter for category→schema mapping.
- Select option filters for dynamic picker UX.

## Internal path

- Bridge: `modules/atomic-widgets/dynamic-tags/` (`Dynamic_Prop_Types_Mapping`, `Dynamic_Tags_Converter`, `Dynamic_Transformer`).
- Extend mapping only via core changes to `Dynamic_Prop_Types_Mapping` or explicit `Dynamic_Prop_Type` in schema definitions.

## See also

- [author-atomic-widget](../author-atomic-widget/SKILL.md) — define props that accept dynamic bindings
- [fundamentals/transformers.md](../../../docs/atomic-builder/fundamentals/transformers.md) — `Dynamic_Transformer`
