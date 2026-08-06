---
name: author-atomic-widget
description: Workflow for creating Elementor v4 atomic widgets and container elements — Atomic_Widget_Base, Atomic_Element_Base, define_props_schema, define_atomic_controls, Twig rendering, and registration hooks. Use for new v4 elements, e-my-widget types, or atomic-widgets module work.
---

# Author atomic widget or element

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

```php
class My_Atomic_Widget extends \Elementor\Modules\AtomicWidgets\Elements\Atomic_Widget_Base {
    use \Elementor\Modules\AtomicWidgets\Elements\Has_Template;

    public static function get_element_type(): string {
        return 'e-my-widget';
    }

    protected static function define_props_schema(): array {
        return [
            'title' => \Elementor\Modules\AtomicWidgets\PropTypes\String_Prop_Type::make()
                ->default( 'Hello' ),
        ];
    }

    protected function define_atomic_controls(): array {
        return [
            \Elementor\Modules\AtomicWidgets\Controls\Section::make()
                ->add_control(
                    \Elementor\Modules\AtomicWidgets\Controls\Text_Control::make()
                        ->bind_to( 'title' )
                ),
        ];
    }
}
```

Test/MCP JSON: `My_Atomic_Widget::generate()` (widget) or `My_Container::generate()` (element).

## Public path

- Plugin owns PHP classes; register on `elementor/widgets/register` or `elementor/elements/elements_registered`.
- Extend schema for **all** types only via `elementor/atomic-widgets/props-schema` when type-agnostic — prefer subclassing for type-specific props.
- Filter `elementor/atomic-widgets/controls` to tweak control trees per element.

## Internal path

- Built-ins live in `modules/atomic-widgets/elements/`; mirror patterns from `Atomic_Heading` and catalog in [elements-catalog.md](../../../docs/atomic-builder/atomic-widgets/elements-catalog.md).
- Category `v4-elements`; save validation via `Props_Parser` / `Style_Parser` in `get_data_for_save()`.
- Frontend: `Render_Props_Resolver::for_settings()`, `Atomic_Styles_Manager` — see [rendering.md](../../../docs/atomic-builder/atomic-widgets/rendering.md).

## See also

- [fundamentals/prop-types.md](../../../docs/atomic-builder/fundamentals/prop-types.md)
- [dynamic-tags/extending.md](../../../docs/atomic-builder/dynamic-tags/extending.md) — dynamic bindings on props
