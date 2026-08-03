# Components overview

> Audience: both
> Module: `modules/components/`, `packages/packages/core/editor-components/`
> Related: [document-model.md](./document-model.md), [instances-and-overrides.md](./instances-and-overrides.md), [../getting-started/experiments.md](../getting-started/experiments.md)

## What it is

Components are reusable Elementor documents — atomic element trees stored once and referenced on pages via **component instances** (`e-component` widget). Each placement can override selected props exposed by the source component.

Spans PHP module (`modules/components/`) and `editor-components` JS package.

## When to use it

- **Design systems** — define a block once; reuse across pages and templates.
- **Parameterized blocks** — expose props (heading, button label, image) as overridables.
- **Nested composition** — place components inside components, subject to circular-dependency rules.

Requires atomic elements only; legacy v3 widgets cannot be saved inside a component document.

## Key concepts

| Concept | Description |
|---------|-------------|
| Component document | WordPress post `elementor_component` holding the source tree |
| Component instance | `e-component` widget referencing a component by `component_id` |
| Overridable prop | Inner element prop marked exposable; stored in component metadata |
| Override | Instance-level value replacing an overridable's origin value |
| Component UID | Stable string (`_elementor_component_uid` meta) used before numeric ID exists |

### Lifecycle

1. **Define** — author component document, mark props overridable.
2. **Place** — insert `e-component` instance from Components tab.
3. **Override** — set per-instance values via instance panel or JSON.
4. **Render** — `Component_Instance_Transformer` loads source, applies overrides, formats inner IDs.

Publishing updates all instances on next render; instances do not store a copy unless detached.

### Gate

`Module::is_experiment_active()` — requires `e_atomic_elements`. JS package registers via `elementor/editor/v2/packages` when PHP module loads.

### Access tiers

`Components_Access_Controller` gates by Pro license:

| Action | Required tier |
|--------|---------------|
| Create, delete, rename, add to page | Pro (active) |
| Edit source, publish, lock | Pro or expired |

### MCP integrators

No dedicated component MCP abilities. Integrate via:

- **REST** — `elementor/v1/components` (see [document-model.md](./document-model.md))
- **Widget schema** — `e-component` excluded from `list-widget-schemas` / `get-widget-schema`
- **Direct JSON** — `component-instance` prop shape in [instances-and-overrides.md](./instances-and-overrides.md)

## Extension

N/A — no public registration hook. Third-party atomic widgets participate automatically (subject to atomic-only validator). Opt out of overridable wrapping via `Overridable_Prop_Type::ignore()` meta.

## Public API

| Symbol | Signature | Purpose | Source |
|--------|-----------|---------|--------|
| `Components_Repository` | `::make()`, `all()`, `get()`, `create()`, `publish_component()`, `archive()`, `update_title()` | Server-side CRUD | `components-repository.php` |
| `Component` (document) | `::TYPE`, `get_component_uid()`, `get_overridable_props()` | Document class + meta | `documents/component.php` |
| `Component_Instance` | `::get_element_type()` → `'e-component'` | Instance widget | `widgets/component-instance.php` |
| `Components_Access_Controller` | `can_create()`, `can_edit()`, `can_lock()`, … | License gating | `components-access-controller.php` |
| `COMPONENT_WIDGET_TYPE` | `'e-component'` | Widget type constant | `editor-components/src/create-component-type.ts` |
| `componentsSelectors` | store selectors | Read component state | `editor-components/src/store/selectors.ts` |
| `componentsActions` | store dispatchers | Mutate component state | `editor-components/src/store/dispatchers.ts` |
| `isComponentInstance` | `( element )` | Type guard | `editor-components/src/utils/is-component-instance.ts` |
| `switchToComponent` | `( componentId )` | Navigate to component document | `editor-components/src/utils/switch-to-component.ts` |

## Internals

**PHP:** `Module` registers CPT, document type, transformers, REST, circular-dependency validation, global-classes post-type extension.

**JS:** `init.ts` registers `e-component` element type, Components tab, instance editing panel, settings transformers, circular-nesting command blocks.

## See also

- [document-model.md](./document-model.md) — storage and REST
- [instances-and-overrides.md](./instances-and-overrides.md) — prop types and override UI
- [nesting-rules.md](./nesting-rules.md) — validators and ID formatting
- [../atomic-widgets/overview.md](../atomic-widgets/overview.md) — atomic prerequisites
- [../editor-packages/core-packages.md](../editor-packages/core-packages.md) — package snapshot
