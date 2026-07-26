# Components overview

> Audience: both
> Module: `modules/components/`, `packages/packages/core/editor-components/`
> Status: draft
> Related: [document-model.md](./document-model.md), [instances-and-overrides.md](./instances-and-overrides.md), [../getting-started/experiments.md](../getting-started/experiments.md)

## What it is

Components are reusable Elementor documents — a tree of atomic elements stored once and referenced on pages via **component instances** (`e-component` widget). A component definition lives in its own document; each placement on a page is an instance that can override selected props exposed by the source component.

The feature spans a PHP module (`modules/components/`) and the `editor-components` JS package. Together they handle document storage, instance rendering, override resolution, circular-nesting prevention, and the Components panel tab in the editor.

## When to use it

- **Design systems** — define a card, hero, or nav block once; reuse it across pages and templates.
- **Parameterized blocks** — expose specific props (heading text, button label, image) as overridables so each instance can differ without detaching.
- **Nested composition** — place one component inside another, subject to circular-dependency rules (see [nesting-rules.md](./nesting-rules.md)).

Components require atomic elements only; legacy v3 widgets cannot be saved inside a component document.

## Key concepts

| Concept | Description |
|---------|-------------|
| Component document | A WordPress post of type `elementor_component` holding the source element tree |
| Component instance | An `e-component` widget on a page/template referencing a component by `component_id` |
| Overridable prop | A prop on an inner element marked as exposable; stored in component metadata |
| Override | An instance-level value replacing an overridable prop's origin value |
| Component UID | Stable string (`_elementor_component_uid` meta) used during creation before a numeric ID exists |

### Experiment gate

| Key | Value |
|-----|-------|
| Experiment name | `e_components` |
| Default | Active (beta, hidden) |
| Dependency | Also requires `e_atomic_elements` |

The module constructor returns early when either experiment is inactive. The JS package is registered via the `elementor/editor/v2/packages` filter only when the PHP module is loaded.

### Access tiers

`Components_Access_Controller` gates operations by Pro license tier:

| Action | Required tier |
|--------|---------------|
| Create, delete, rename, add to page | Pro (active license) |
| Edit source, publish, lock | Pro or expired license |

Core (no Pro) users can view the feature but cannot create or place components.

## Extension

N/A — components are not currently extensible via a public registration hook. Third-party atomic widgets automatically participate in component documents (subject to the atomic-only validator) and can have props wrapped as `overridable` via the schema extender described in [instances-and-overrides.md](./instances-and-overrides.md).

## Internals

**PHP entry:** `Elementor\Modules\Components\Module` registers the CPT, document type, settings transformers, REST routes, circular-dependency validation on save, and global-classes post-type extension.

**JS entry:** `packages/packages/core/editor-components/src/init.ts` registers the `e-component` element type, Components panel tab, instance editing panel replacement, settings transformers, and circular-nesting command blocks.

**Widget type:** `e-component` (`Component_Instance::get_element_type()`). The widget is hidden from the generic elements panel; instances are inserted from the Components tab.

**Package:** `editor-components` is added to the v2 packages array alongside other v4 editor packages.

## See also

- [document-model.md](./document-model.md) — storage and REST API
- [instances-and-overrides.md](./instances-and-overrides.md) — prop types and override UI
- [nesting-rules.md](./nesting-rules.md) — validators and ID formatting
- [../atomic-widgets/overview.md](../atomic-widgets/overview.md) — atomic element prerequisites
- [../editor-packages/core-packages.md](../editor-packages/core-packages.md) — package snapshot
