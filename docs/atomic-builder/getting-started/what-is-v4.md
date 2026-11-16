# What is Elementor v4?

> Audience: both
> Module: `modules/atomic-widgets/`, `modules/atomic-opt-in/`
> Related: [experiments.md](experiments.md), [../architecture/overview.md](../architecture/overview.md), [../fundamentals/prop-value.md](../fundamentals/prop-value.md)

## What it is

**Elementor v4** is a typed, schema-driven editing model built around **atomic elements**. Each element declares a **props schema** (settings) and uses a shared **style schema** for visual properties. Values are stored as **PropValues** (`{ $$type, value }`) and resolved to CSS or HTML at render time.

| Layer | Location | Role |
|-------|----------|------|
| PHP modules | `modules/atomic-widgets/`, `modules/global-classes/`, … | Experiment gates, element registration, REST/MCP, CSS output |
| Editor V2 packages | `packages/packages/` | React micro-frontends via `elementor/editor/v2/packages` |
| Legacy editor shell | `assets/dev/js/editor/` | Canvas host; v2 extends via `editor-v1-adapters` |

Opt-in UX lives in `modules/atomic-opt-in/`; experiment registration in `modules/atomic-widgets/opt-in/`.

## When to use it

- **Addon developers** extending atomic widgets or editor packages
- **Contributors** tracing bugs across PHP ↔ JS boundaries
- **Agent integrators** needing context before MCP abilities
- **Power users** wondering about `v4-elements` or `e-flexbox` / `e-grid`

For widget authoring: [developers.elementor.com](https://developers.elementor.com) and [../atomic-widgets/authoring-widgets.md](../atomic-widgets/authoring-widgets.md).

## Key concepts

### Atomic vs legacy

| Aspect | Legacy (v3) | Atomic (v4) |
|--------|-------------|-------------|
| Settings | Control stacks | Typed props schema |
| Styles | Per-widget CSS controls | Shared `Style_Schema` + variants |
| Storage | Flat arrays | PropValue envelopes (`$$type`) |
| Editor UI | jQuery panel | Editor V2 React packages |
| Rendering | PHP `render()` + inline CSS | Twig + `Render_Props_Resolver` + CSS files |

Legacy widgets remain on existing sites. v4 elements appear under **v4-elements** when `e_atomic_elements` is active.

### Widget vs element

- **Widget** — leaf content (`e-heading`, `e-button`, `e-image`). Registered via `Widgets_Manager`.
- **Element** — structural/container (`e-flexbox`, `e-grid`, `e-tabs`). Registered via `Elements_Manager`.

Both extend atomic base classes. See [../atomic-widgets/overview.md](../atomic-widgets/overview.md).

### End-user changes (when v4 is on)

- Layout primitives: `e-flexbox`, `e-div-block`, `e-grid`
- Content widgets: heading, paragraph, button, image, SVG, divider, video, tabs, …
- **Global classes**, **variables**, **components**, **interactions**
- Default container type → `e-flexbox` when `e_opt_in_v4` is active (`ContainerHelper.isV4OptIn()`)

v3 and v4 elements coexist; legacy content is not auto-migrated.

### Public API

| Symbol | Signature | Purpose |
|--------|-----------|---------|
| `Module::is_active()` | `static is_active(): bool` | Whether `e_atomic_elements` is on (`module.php`) |
| `Module::EXPERIMENT_NAME` | `'e_atomic_elements'` | Main atomic experiment constant |
| `Utils::is_atomic()` | `static is_atomic( $element_instance ): bool` | Detect atomic widget/element instance (`utils/utils.php`) |
| `Utils::generate_id()` | `static generate_id( string $prefix, array $existing_ids ): string` | Generate prefixed unique id |
| `Has_Atomic_Base::get_props_schema()` | `static get_props_schema(): array` | Element props schema + `elementor/atomic-widgets/props-schema` filter |

## Extension

1. Register atomic widget/element — [../atomic-widgets/authoring-widgets.md](../atomic-widgets/authoring-widgets.md)
2. Add editor package — [../editor-packages/extending-editor.md](../editor-packages/extending-editor.md)
3. Hook props or styles schema — [../atomic-widgets/hooks.md](../atomic-widgets/hooks.md)

## Internals

```
e_opt_in_v4 (opt-in/opt-in.php)
  └─► Welcome screen, default container behavior

e_atomic_elements (atomic-widgets/module.php)
  └─► Module::__construct() — widgets, elements, packages, transformers
        └─► global-classes, variables, components, interactions gate on same flag
```

`Module::is_active()` short-circuits the entire atomic-widgets module when `e_atomic_elements` is off.

## See also

- [experiments.md](experiments.md)
- [glossary.md](glossary.md)
- [../architecture/overview.md](../architecture/overview.md)
- [../opt-in/activation.md](../opt-in/activation.md)
