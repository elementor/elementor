# Glossary

> Audience: both
> Module: (cross-cutting)
> Status: final
> Related: [../fundamentals/prop-value.md](../fundamentals/prop-value.md), [../global-classes/data-model.md](../global-classes/data-model.md), [../mcp/composition-workflow.md](../mcp/composition-workflow.md)

## What it is

A shared vocabulary for Elementor v4 documentation. Terms here appear across PHP modules, Editor V2 packages, MCP abilities, and saved document JSON.

## When to use it

- Unfamiliar with `$$type` or PropValue envelopes.
- Confused about **label** vs internal **id** (especially global classes and variables).
- Distinguishing atomic elements from legacy widgets.
- Reading MCP composition XML or CSS converter output.

## Key concepts

### PropValue

The atomic storage unit for a typed setting or style property. Serialized as a JSON object:

```json
{
  "$$type": "string",
  "value": "Hello"
}
```

- **`$$type`** — discriminator matching a prop type key (e.g. `size`, `color`, `global-color-variable`).
- **`value`** — payload shape defined by that prop type.
- Optional **`disabled`** — when true, the prop is ignored at resolve time.
- **Null / reset** — semantics vary by prop type; see [../fundamentals/prop-value.md](../fundamentals/prop-value.md).

PropValues appear in element `settings` and `styles` arrays. PHP `Props_Parser` validates on save/import; `Render_Props_Resolver` resolves at render time; JS `validatePropValue` enforces the schema live in the editor.

### `$$type`

The type key inside a PropValue envelope. Must match a registered prop type (`Prop_Type::get_key()`). Union prop types dispatch on `$$type` to select the nested schema.

Not to be confused with element `widgetType` / `elType` (e.g. `e-heading`), which identifies the element kind.

### Label vs id

v4 features that users name (global classes, variables) use a **label** as the public, author-facing identifier:

| Concept | Label (public) | Internal id |
|---------|----------------|-------------|
| Global class | `wc26-gold` (user-chosen) | `g-abc1234` (generated, `g-` prefix) |
| Variable | `primary-brand` | stored in kit meta; referenced by label in `var(--primary-brand)` |
| MCP composition | N/A | `configuration-id` attribute on XML elements |

**Rule:** use labels in examples, MCP payloads, and `classes` prop values — not internal `g-*` ids.

### Atomic element vs legacy widget

| | Atomic element/widget | Legacy widget |
|--|----------------------|---------------|
| Type key | `e-*` prefix (`e-heading`, `e-flexbox`) | Historical names (`heading`, `button`) |
| Settings | Props schema + PropValues | Control stacks |
| Detection | `Utils::is_atomic()` | — |
| Panel category | `v4-elements` | Legacy categories |

"Atomic widget" = leaf type; "atomic element" = structural/container type. Both use the same base APIs.

### Kit

An Elementor **kit** is the active site-wide design system document (colors, typography, and — in v4 — global classes and variables). Kit-scoped data is stored as post meta on the kit post. Global classes and variables are bound to the active kit; switching kits can duplicate class posts per kit.

### Style variant

A named breakpoint/state layer on an element's styles object (e.g. `desktop`, `mobile`, hover states). Style props are keyed by variant within the element's `styles` structure. Canonical style **keys** come from `Style_Schema` — see [../fundamentals/style-schema.md](../fundamentals/style-schema.md).

### Overridable

A component prop type (`overridable`) that marks a value on a component definition as replaceable when the component is instanced. Instance documents use `override` prop types to supply per-instance values. See [../components/instances-and-overrides.md](../components/instances-and-overrides.md).

### configuration-id (MCP)

An XML attribute on elements in MCP `build-composition` input/output:

```xml
<e-heading configuration-id="hero-title"/>
```

Maps a logical name to a generated element id in the response so callers can reference elements in subsequent `element_config`, `style`, and `classes` maps. IDs are unique within a composition call.

### customCss vs rejected (CSS converter)

When raw CSS is converted to atomic style props via `Css_Converter::convert()`:

| Bucket | Meaning |
|--------|---------|
| **`props`** | Successfully mapped atomic style PropValues |
| **`customCss`** | Declarations that could not be structured but are kept as raw CSS |
| **`rejected`** | Declarations explicitly declined (incompatible, invalid, or blocked by a `Rejected_Converter`) |

`customCss` is applied as-is; `rejected` is surfaced to the client for error reporting. See [../css-converter/overview.md](../css-converter/overview.md).

### Editor V2 package

A micro-frontend JS bundle (e.g. `editor-canvas`) registered via `elementor/editor/v2/packages` and loaded by `Editor_Loader`. Distinct from legacy `wp_enqueue_script` handles used by some modules (e.g. interactions frontend).

## Extension

N/A — glossary terms are defined by core modules. To introduce a new cross-cutting term, add it here when a new prop type or storage pattern ships.

## Internals

### PropValue resolution contexts

Transformers register per context:

- `elementor/atomic-widgets/settings/transformers/register`
- `elementor/atomic-widgets/styles/transformers/register`
- `elementor/atomic-widgets/import/transformers/register`
- `elementor/atomic-widgets/export/transformers/register`

The `$$type` key selects the transformer within each registry.

### Global class id generation

Internal ids use `g-` prefix: `Utils::generate_id( 'g-', $existing_ids )` in global-classes import utilities.

## See also

- [../fundamentals/prop-value.md](../fundamentals/prop-value.md)
- [../fundamentals/prop-types.md](../fundamentals/prop-types.md)
- [../global-classes/data-model.md](../global-classes/data-model.md)
- [../variables/types.md](../variables/types.md)
- [../mcp/composition-workflow.md](../mcp/composition-workflow.md)
- [../css-converter/overview.md](../css-converter/overview.md)
