# Atomic widgets overview

> Audience: both
> Module: `modules/atomic-widgets/`
> Related: [authoring-widgets.md](authoring-widgets.md), [../getting-started/experiments.md](../getting-started/experiments.md), [../architecture/packages-map.md](../architecture/packages-map.md)

## What it is

PHP foundation for **typed, schema-driven v4 elements**. Each type declares:

- **Props schema** — validated settings stored as PropValues
- **Atomic controls** — editor panel UI bound to schema keys
- Optional **base styles**, **Twig templates**, **nesting rules**

The module registers editor JS packages, prop transformers, style generation, and frontend scripts.

## When to use it

- Building or extending a v4 widget or container element
- Tracing editor save → prop resolution → Twig/CSS on the frontend
- Integrating with MCP composition (`llm_guidance` in schemas)

## Key concepts

### Experiment gate

Active when **`e_atomic_elements`** is on (`Module::EXPERIMENT_NAME`). New sites on Elementor ≥ 4.0.0 auto-enable it.

### Widget vs element

| Kind | PHP base | Registration hook | ID field | Examples |
|------|----------|-------------------|----------|----------|
| Widget | `Atomic_Widget_Base` | `elementor/widgets/register` | `widgetType` | `e-heading`, `e-button` |
| Element | `Atomic_Element_Base` | `elementor/elements/elements_registered` | `elType` | `e-flexbox`, `e-tabs` |

Both use `Has_Atomic_Base` (schema, controls, styles, save validation). Widgets add `Has_Template` for Twig rendering.

### Panel category

Built-in types appear under **`v4-elements`**.

### Built-in catalog (summary)

**Widgets:** `e-heading`, `e-image`, `e-paragraph`, `e-svg`, `e-button`, `e-youtube`, `e-divider`, `e-self-hosted-video`

**Elements:** `e-div-block`, `e-flexbox`, `e-grid`, `e-tabs` (+ `e-tabs-menu`, `e-tab`, `e-tabs-content-area`, `e-tab-content`)

**Form family** (Pro + `e_pro_atomic_form`): see [elements-catalog.md](elements-catalog.md).

## Public API

| Symbol | Signature | Purpose |
|--------|-----------|---------|
| `Atomic_Widget_Base` | `abstract protected static function define_props_schema(): array` | Leaf widget base; also `define_atomic_controls()`, `get_element_type()` |
| `Atomic_Element_Base` | `protected function define_allowed_child_types(): array` | Container base; also `define_default_children()`, `define_default_html_tag()` |
| `Has_Atomic_Base` | `public static function get_props_schema(): array` | Filtered schema (`elementor/atomic-widgets/props-schema`); auto-injects `_cssid` |
| `Has_Atomic_Base` | `public function get_atomic_settings(): array` | Resolved settings for Twig/PHP render |
| `Style_Schema` | `public static function get(): array` | Canonical style keys (filter: `elementor/atomic-widgets/styles/schema`) |
| `Render_Props_Resolver` | `public static function for_settings(): self` | Settings-context resolver; also `for_styles()`, `for_plain()` |
| `Render_Props_Resolver` | `public function resolve( array $schema, array $props ): array` | Walk schema and apply transformers |
| `Atomic_Styles_Manager` | `public static function instance(): self` | Singleton CSS orchestrator |
| `Atomic_Styles_Manager` | `public function register( array $path, callable $get_style_defs ): void` | Register a style provider (hook: `styles/register`) |
| `Atomic_Widget_Base` / `Atomic_Element_Base` | `public static function generate()` | Programmatic element tree via `Widget_Builder` / `Element_Builder` |
| `*Prop_Type` | `public static function make(): static` | Fluent schema builder (`->default()`, `->meta()`, `->enum()`) |
| `*Prop_Type` | `public static function generate( $value, bool $disable = false ): array` | Build a PropValue `{ $$type, value }` |

Source: `elements/base/atomic-widget-base.php`, `atomic-element-base.php`, `has-atomic-base.php`, `styles/style-schema.php`, `props-resolver/render-props-resolver.php`, `styles/atomic-styles-manager.php`, `prop-types/base/plain-prop-type.php`.

## Extension

Register types per [authoring-widgets.md](authoring-widgets.md). Extend schema via `elementor/atomic-widgets/props-schema` filter.

## Internals

| Area | Path |
|------|------|
| Entry | `module.php` |
| Elements | `elements/` |
| Controls | `controls/types/` |
| Prop resolution | `props-resolver/` |
| Styles | `styles/` |
| Editor packages | `Module::PACKAGES` |

JS counterparts: [../architecture/packages-map.md](../architecture/packages-map.md).

## See also

- [authoring-widgets.md](authoring-widgets.md) — registration
- [rendering.md](rendering.md) — Twig and CSS pipeline
- [hooks.md](hooks.md) — extension hooks
- [../fundamentals/prop-value.md](../fundamentals/prop-value.md)
