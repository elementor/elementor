---
name: create-atomic-widget
description: "External: Create atomic widgets and container elements from a third-party plugin. Atomic_Widget_Base, define_props_schema, elementor/widgets/register, props, controls, Twig."
---

# Create atomic widget

> **Scope: External** — the full documented outcome is shippable from a 3rd-party plugin via `elementor/widgets/register` / `elementor/elements/elements_registered`; no Elementor Core changes required. Changing the built-in element catalog is Core-only. Full split + disclaimer: [skills-scope.md](../../../docs/atomic-builder/skills-scope.md).

## Implementation location

- **PHP:** existing or new **third-party plugin repository**; plugin-owned namespace/module (e.g. `MyPlugin\AtomicWidgets\`).
- **Do not modify Elementor Core.** Built-in elements live in Core at `modules/atomic-widgets/elements/` — mirror patterns there only as reference.
- **Runnable reference:** [examples/example-plugin/](../../../examples/example-plugin/) (`Atomic_Greeting_Widget` + Twig). Playground: [tests/playwright/blueprints/example-plugin.json](../../../tests/playwright/blueprints/example-plugin.json).

## Prerequisites

- Experiment `e_atomic_elements` active — see [getting-started/experiments.md](../../../docs/atomic-builder/getting-started/experiments.md).
- Often also `e_opt_in_v4` on sites still on legacy editor UX.

Read first: [atomic-widgets/authoring-widgets.md](../../../docs/atomic-builder/atomic-widgets/authoring-widgets.md), [hooks.md](../../../docs/atomic-builder/atomic-widgets/hooks.md), [rendering.md](../../../docs/atomic-builder/atomic-widgets/rendering.md).

## Checklist

1. **Pick base class**
   - Leaf widget → `Atomic_Widget_Base` + `Has_Template` when using Twig.
   - Container → `Atomic_Element_Base` + `Has_Element_Template`; set `$this->meta( 'is_container', true )` in constructor.
2. **Implement required API**
   - `define_props_schema()` — prop types with `->default()`; values are PropValue `{ $$type, value }`.
   - `define_atomic_controls()` — `Section::make()->set_items([ Control::bind_to( 'key' ) ])`; use `Select_Control` for enum prop types.
   - `get_element_type()` — stable id (e.g. `e-my-widget`).
3. **Optional layers**
   - Twig: `get_templates()`, `.html.twig` files.
   - `define_base_styles()` → `Style_Definition` maps.
   - Container: `define_allowed_child_types()`, `define_default_children()`, `define_default_html_tag()`.
4. **Register**
   - Widget: `elementor/widgets/register` → `$manager->register( new My_Widget() )`.
   - Element: `elementor/elements/elements_registered` → `$manager->register_element_type( new My_Container() )`.
5. **Verify**
   - Control keys match schema keys exactly.
   - Saved data uses PropValue envelope per [prop-value.md](../../../docs/atomic-builder/fundamentals/prop-value.md).
   - Widget appears under **v4-elements** panel (`Atomic_Widget_Base::get_categories()` returns `v4-elements` by default — custom plugins inherit this; no override needed).
   - `get_controls()` stays empty (legacy v3 controls unused).

## Canonical example (use this, not a shortened skeleton)

Full corrected walkthrough: [docs/atomic-builder/examples/create-atomic-widget.md](../../../docs/atomic-builder/examples/create-atomic-widget.md).

Key fixes vs older snippets: base classes under `Elements\Base\`; primitives under `PropTypes\Primitives\`; `Section::make()->set_items()` not `add_control()`.

Test/MCP JSON: `My_Widget::generate()` (widget) or `My_Container::generate()` (element; uses `get_type()`, not `get_element_type()`).

## External implementation path

- Plugin owns PHP classes; register on `elementor/widgets/register` or `elementor/elements/elements_registered`.
- Extend schema for **all** types only via `elementor/atomic-widgets/props-schema` when type-agnostic — prefer subclassing for type-specific props.
- Filter `elementor/atomic-widgets/controls` to tweak control trees per element.

## Core reference paths (do not edit)

- Built-ins: `modules/atomic-widgets/elements/` — see [elements-catalog.md](../../../docs/atomic-builder/atomic-widgets/elements-catalog.md).
- Save validation via `Props_Parser` / `Style_Parser`; frontend via [rendering.md](../../../docs/atomic-builder/atomic-widgets/rendering.md).

## See also

- [fundamentals/prop-types.md](../../../docs/atomic-builder/fundamentals/prop-types.md)
- [extend-prop-types](../extend-prop-types/SKILL.md) — custom prop types on widget schema
- [dynamic-tags/extending.md](../../../docs/atomic-builder/dynamic-tags/extending.md) — dynamic bindings on props
