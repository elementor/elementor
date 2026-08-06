---
name: create-atomic-widget
description: "External: Create atomic widgets and container elements from a third-party plugin. Atomic_Widget_Base, define_props_schema, elementor/widgets/register, props, controls, Twig."
---

# Create atomic widget

> **Scope: External** — the full documented outcome is shippable from a 3rd-party plugin via `elementor/widgets/register` / `elementor/elements/elements_registered`; no Elementor Core changes required. Changing the built-in element catalog is Core-only. Full split + disclaimer: [skills-scope.md](../../../docs/atomic-builder/skills-scope.md).

## Implementation location

- **PHP:** existing or new **third-party plugin repository**; plugin-owned namespace/module (e.g. `MyPlugin\AtomicWidgets\`).
- **Do not modify Elementor Core.** Built-in elements live in Core at `modules/atomic-widgets/elements/` — mirror patterns there only as reference.

Read first: [atomic-widgets/authoring-widgets.md](../../../docs/atomic-builder/atomic-widgets/authoring-widgets.md), [hooks.md](../../../docs/atomic-builder/atomic-widgets/hooks.md), [rendering.md](../../../docs/atomic-builder/atomic-widgets/rendering.md).

## Checklist

1. **Pick base class**
   - Leaf widget → `Atomic_Widget_Base` + optional `Has_Template` for Twig.
   - Container → `Atomic_Element_Base`; set `$this->meta( 'is_container', true )` in constructor.
2. **Implement required API**
   - `define_props_schema()` — prop types with `->default()`; values are PropValue `{ $$type, value }`.
   - `define_atomic_controls()` — `Section` trees; every control `->bind_to( 'schema_key' )`.
   - `get_element_type()` — stable id (e.g. `e-my-widget`).
3. **Optional layers**
   - Twig: `get_templates()`, `.html.twig` files; macros in `elements/base/_macros.html.twig`.
   - `define_base_styles()` → `Style_Definition` maps (keys → CSS class suffixes).
   - Container: `define_allowed_child_types()` (empty = any child), `define_default_children()`, `define_default_html_tag()`.
4. **Register**
   - Widget: `elementor/widgets/register` → `$manager->register( new My_Widget() )`.
   - Element: `elementor/elements/elements_registered` → `$manager->register_element_type( new My_Container() )`.
5. **Verify**
   - Control keys match schema keys exactly.
   - Saved data uses PropValue envelope per [prop-value.md](../../../docs/atomic-builder/fundamentals/prop-value.md).
   - Editor category `v4-elements`; `get_controls()` stays empty (legacy v3 controls unused).

## Minimal skeleton

Requires experiment `e_atomic_elements`. Full runnable example: [docs/atomic-builder/examples/create-atomic-widget.md](../../../docs/atomic-builder/examples/create-atomic-widget.md).

```php
class My_Atomic_Widget extends \Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Widget_Base {
    use \Elementor\Modules\AtomicWidgets\Elements\Base\Has_Template;

    public static function get_element_type(): string { return 'e-my-widget'; }
    public function get_title() { return 'My Widget'; }
    public function get_icon() { return 'eicon-heading'; }

    protected static function define_props_schema(): array {
        return [
            'title' => \Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type::make()
                ->default( 'Hello' ),
        ];
    }

    protected function define_atomic_controls(): array {
        return [
            \Elementor\Modules\AtomicWidgets\Controls\Section::make()
                ->set_items( [
                    \Elementor\Modules\AtomicWidgets\Controls\Types\Text_Control::bind_to( 'title' ),
                ] ),
        ];
    }

    protected function get_templates(): array {
        return [ 'my-plugin/my-widget' => __DIR__ . '/my-widget.html.twig' ];
    }
}
```

Test/MCP JSON: `My_Atomic_Widget::generate()` (widget) or `My_Container::generate()` (element; uses `get_type()`).

## External implementation path

- Plugin owns PHP classes; register on `elementor/widgets/register` or `elementor/elements/elements_registered`.
- Extend schema for **all** types only via `elementor/atomic-widgets/props-schema` when type-agnostic — prefer subclassing for type-specific props.
- Filter `elementor/atomic-widgets/controls` to tweak control trees per element.

## Core reference paths (do not edit)

- Built-ins live in `modules/atomic-widgets/elements/`; mirror patterns from `Atomic_Heading` and catalog in [elements-catalog.md](../../../docs/atomic-builder/atomic-widgets/elements-catalog.md).
- Category `v4-elements`; save validation via `Props_Parser` / `Style_Parser` in `get_data_for_save()`.
- Frontend: `Render_Props_Resolver::for_settings()`, `Atomic_Styles_Manager` — see [rendering.md](../../../docs/atomic-builder/atomic-widgets/rendering.md).

## See also

- [fundamentals/prop-types.md](../../../docs/atomic-builder/fundamentals/prop-types.md)
- [dynamic-tags/extending.md](../../../docs/atomic-builder/dynamic-tags/extending.md) — dynamic bindings on props
