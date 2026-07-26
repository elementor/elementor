# What is Elementor v4?

> Audience: both
> Module: `modules/atomic-widgets/`, `modules/atomic-opt-in/`
> Status: draft
> Related: [experiments.md](experiments.md), [../architecture/overview.md](../architecture/overview.md), [../fundamentals/prop-value.md](../fundamentals/prop-value.md)

## What it is

**Elementor v4** is Elementor's next-generation editing experience built around **atomic elements** — a typed, schema-driven model for element settings and styles. Instead of legacy controls that map loosely to CSS, each atomic element declares a **props schema** (settings) and uses a shared **style schema** for visual properties. Values are stored as **PropValues** (`{ $$type, value }` envelopes) and resolved to CSS or HTML at render time.

The v4 stack spans:

- **PHP modules** (`modules/atomic-widgets/`, `modules/global-classes/`, etc.) — experiment gates, element registration, REST/MCP, CSS output.
- **Editor V2 packages** (`packages/packages/core/`, `packages/packages/libs/`) — React micro-frontends loaded via `elementor/editor/v2/packages`.
- **Legacy editor shell** — v1 editor still hosts the canvas; v2 packages extend it through adapters (`editor-v1-adapters`).

Opt-in is coordinated by `modules/atomic-widgets/opt-in/` and surfaced through `modules/atomic-opt-in/` (settings page, welcome screen, panel chip).

## When to use it

Read this page when you need to understand **what changed** before diving into module-specific docs:

- **Addon developers** extending atomic widgets or editor packages.
- **Internal contributors** mapping a bug across PHP and JS boundaries.
- **LLM/agent integrators** who need context before calling MCP abilities.
- **Power users** wondering why the panel shows "v4-elements" or new layout primitives (`e-flexbox`, `e-grid`).

For hands-on widget authoring, continue to [developers.elementor.com](https://developers.elementor.com) (published tutorial track) and [../atomic-widgets/authoring-widgets.md](../atomic-widgets/authoring-widgets.md).

## Key concepts

### Atomic vs legacy

| Aspect | Legacy (v3) | Atomic (v4) |
|--------|-------------|-------------|
| Settings | Control stacks (`controls_manager`) | Typed props schema per element |
| Styles | Per-widget CSS controls | Shared `Style_Schema` + variant keys |
| Storage | Flat settings arrays | PropValue envelopes with `$$type` |
| Editor UI | jQuery panel | Editor V2 React packages |
| Rendering | PHP `render()` + inline CSS | Twig templates + `Render_Props_Resolver` + CSS files |

Legacy widgets remain on existing sites. v4 elements appear under the **v4-elements** panel category when `e_atomic_elements` is active.

### Widget vs element

In v4 terminology:

- **Widget** — leaf content block (e.g. `e-heading`, `e-button`, `e-image`). Registered via `Widgets_Manager`.
- **Element** — structural/container type (e.g. `e-flexbox`, `e-grid`, `e-tabs`). Registered via `Elements_Manager`.

Both extend atomic base classes and share the props/style model. See [../atomic-widgets/overview.md](../atomic-widgets/overview.md).

### What changes for end users

When v4 is enabled (see [experiments.md](experiments.md)):

- New layout primitives: flexbox (`e-flexbox`), div block (`e-div-block`), grid (`e-grid`).
- New content widgets: heading, paragraph, button, image, SVG, divider, video, tabs, etc.
- **Global classes** — kit-scoped reusable style classes applied via a `classes` prop.
- **Variables** — design tokens (color, font, size) referenced in styles.
- **Components** — reusable element trees with overridable props.
- **Interactions** — motion/animation triggers on elements.
- Default new container type shifts to `e-flexbox` when `e_opt_in_v4` is active (`ContainerHelper.isV4OptIn()`).

Existing legacy content is not automatically migrated; v4 and v3 elements can coexist in a document.

### Editor V2 micro-frontends

The editor loads independent JS packages (canvas, editing panel, styles repository, etc.) registered through the `elementor/editor/v2/packages` filter. Internal packages follow the same extension pattern as third-party code. See [../editor-packages/overview.md](../editor-packages/overview.md) and `packages/docs/architecture.md`.

## Extension

N/A at this overview level. To extend v4:

1. Register a new atomic widget/element — [../atomic-widgets/authoring-widgets.md](../atomic-widgets/authoring-widgets.md).
2. Add an editor package — [../editor-packages/extending-editor.md](../editor-packages/extending-editor.md).
3. Hook props or styles schema — [../atomic-widgets/hooks.md](../atomic-widgets/hooks.md).

## Internals

### Module activation chain

```
e_opt_in_v4_page (atomic-opt-in module gate)
  └─► Opt_In::init() registers e_opt_in_v4 experiment
        └─► opt-in AJAX/REST enables bundle (see experiments.md)

e_atomic_elements (atomic-widgets module gate)
  └─► Module::__construct() registers widgets, elements, packages, transformers
        └─► Dependent modules check is_feature_active('e_atomic_elements')
```

`modules/atomic-widgets/module.php` short-circuits entirely when `e_atomic_elements` is inactive (`Module::is_active()`).

### Panel category chip

When the panel renders the `v4-elements` category, atomic-widgets injects a "New" chip via `elementor/editor/templates/panel/category` (see `render_panel_category_chip()` in `module.php`).

## See also

- [experiments.md](experiments.md) — experiment names and dependencies
- [glossary.md](glossary.md) — PropValue, label vs id
- [../architecture/overview.md](../architecture/overview.md) — system diagram
- [../opt-in/activation.md](../opt-in/activation.md) — activation UX
- [developers.elementor.com](https://developers.elementor.com) — legacy v3 APIs
