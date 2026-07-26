# Atomic widgets overview

> Audience: both
> Module: `modules/atomic-widgets/`
> Status: draft
> Related: [authoring-widgets.md](authoring-widgets.md), [../getting-started/experiments.md](../getting-started/experiments.md), [../architecture/packages-map.md](../architecture/packages-map.md)

## What it is

The atomic-widgets module is Elementor v4's PHP foundation for **typed, schema-driven elements**. Each atomic type declares:

- A **props schema** (`define_props_schema()`) — validated settings stored as PropValues
- **Atomic controls** (`define_atomic_controls()`) — editor panel UI bound to schema keys
- Optional **base styles**, **Twig templates**, and **nesting rules**

The module registers editor JS packages (`editor-canvas`, `editor-editing-panel`, `editor-styles-repository`, etc.) and wires prop transformers, style generation, and frontend script loading.

## When to use it

- Building or extending a v4 element or widget
- Understanding how built-in types (`e-heading`, `e-flexbox`, …) are registered
- Tracing data from editor save → prop resolution → Twig/CSS on the frontend
- Integrating with MCP composition (schemas expose `llm_guidance`; see [elements-catalog.md](elements-catalog.md))

## Key concepts

### Experiment gate

The module is active only when experiment **`e_atomic_elements`** is on (`Module::EXPERIMENT_NAME`). New sites on Elementor ≥ 4.0.0 auto-enable it. See [../getting-started/experiments.md](../getting-started/experiments.md).

### Widget vs element

| Kind | PHP base | Registered via | `elType` | Example types |
|------|----------|----------------|----------|---------------|
| **Widget** | `Atomic_Widget_Base` | `elementor/widgets/register` | `widget` + `widgetType` | `e-heading`, `e-button`, `e-image` |
| **Element** (container / structure) | `Atomic_Element_Base` | `elementor/elements/elements_registered` | element `elType` | `e-flexbox`, `e-div-block`, `e-grid`, `e-tabs` |

Both share the `Has_Atomic_Base` trait (props schema, controls, styles, save validation). Widgets use `Has_Template` for Twig rendering; container elements often use `Has_Element_Template` and default `before_render`/`after_render` wrappers.

### Panel category

Built-in atomic types appear under editor category **`v4-elements`** (chip label "New").

### Built-in catalog (summary)

Registered in `module.php` when the experiment is active:

**Widgets:** `e-heading`, `e-image`, `e-paragraph`, `e-svg`, `e-button`, `e-youtube`, `e-divider`, `e-self-hosted-video`

**Elements:** `e-div-block`, `e-flexbox`, `e-grid`, `e-tabs` (+ `e-tabs-menu`, `e-tab`, `e-tabs-content-area`, `e-tab-content`)

**Conditional:** `e-form` (+ success/error message children) when Pro + `e_pro_atomic_form`; promotion stubs (`e-form`, `e-collection-loop`) on free sites.

Full snapshot with nesting: [elements-catalog.md](elements-catalog.md).

## Extension

Register new types through the same APIs core uses — see [authoring-widgets.md](authoring-widgets.md). Prefer extending schema via `elementor/atomic-widgets/props-schema` over hard-coding type lists.

## Internals

- Entry: `modules/atomic-widgets/module.php`
- Elements: `modules/atomic-widgets/elements/`
- Controls: `modules/atomic-widgets/controls/types/`
- Prop resolution: `modules/atomic-widgets/props-resolver/`
- Styles pipeline: `modules/atomic-widgets/styles/`
- Editor packages: `Module::PACKAGES` array

JS counterparts are listed in [../architecture/packages-map.md](../architecture/packages-map.md).

## See also

- [authoring-widgets.md](authoring-widgets.md) — how to author and register
- [rendering.md](rendering.md) — Twig and CSS pipeline
- [hooks.md](hooks.md) — extension hooks
- [../fundamentals/prop-value.md](../fundamentals/prop-value.md)
