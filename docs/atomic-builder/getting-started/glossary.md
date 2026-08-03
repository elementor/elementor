# Glossary

> Audience: both
> Module: (cross-cutting)
> Related: [../fundamentals/prop-value.md](../fundamentals/prop-value.md), [../global-classes/data-model.md](../global-classes/data-model.md), [../mcp/composition-workflow.md](../mcp/composition-workflow.md)

## What it is

Shared vocabulary for v4 docs: PHP modules, Editor V2 packages, MCP abilities, and saved document JSON.

## When to use it

- Unfamiliar with `$$type` or PropValue envelopes
- Confused about **label** vs internal **id** (global classes, variables)
- Distinguishing atomic elements from legacy widgets
- Reading MCP composition XML or CSS converter output

## Key concepts

### PropValue

Typed storage unit. Serialized as:

```json
{ "$$type": "string", "value": "Hello" }
```

| Field | Meaning |
|-------|---------|
| `$$type` | Prop type key (`size`, `color`, `global-color-variable`, …) |
| `value` | Payload shape for that type |
| `disabled` (optional) | When `true`, skipped at resolve time |

Null/reset semantics: [../fundamentals/prop-value.md](../fundamentals/prop-value.md).

### `$$type`

Type discriminator inside a PropValue. Must match `Prop_Type::get_key()`. Union types dispatch on `$$type` to select the nested schema.

Not the same as element `widgetType` / `elType` (e.g. `e-heading`).

### Label vs id

| Concept | Label (public) | Internal id |
|---------|----------------|-------------|
| Global class | `wc26-gold` | `g-abc1234` (`g-` prefix) |
| Variable | `primary-brand` | Kit meta; referenced as `var(--primary-brand)` |
| MCP composition | N/A | `configuration-id` on XML elements |

Use labels in examples, MCP payloads, and `classes` prop values.

### Atomic element vs legacy widget

| | Atomic | Legacy |
|--|--------|--------|
| Type key | `e-*` (`e-heading`, `e-flexbox`) | Historical names (`heading`) |
| Settings | Props schema + PropValues | Control stacks |
| Detection | `Utils::is_atomic()` | — |
| Panel category | `v4-elements` | Legacy categories |

### Kit

Active site-wide design system document. Kit-scoped data (global classes, variables) lives as post meta on the kit post.

### Style variant

Named breakpoint/state layer on an element's `styles` (e.g. `desktop`, `mobile` + `hover`). Canonical keys from `Style_Schema` — [../fundamentals/style-schema.md](../fundamentals/style-schema.md).

### Overridable

Component prop type marking a definition value as replaceable on instance. Instances use `override` types. See [../components/instances-and-overrides.md](../components/instances-and-overrides.md).

### configuration-id (MCP)

XML attribute in `build-composition` input/output:

```xml
<e-heading configuration-id="hero-title"/>
```

Maps a logical name to a generated element id for subsequent `element_config`, `style`, and `classes` maps.

### customCss vs rejected (CSS converter)

| Bucket | Meaning |
|--------|---------|
| `props` | Mapped atomic style PropValues |
| `customCss` | Unstructured declarations kept as raw CSS |
| `rejected` | Declarations declined (invalid or blocked) |

See [../css-converter/overview.md](../css-converter/overview.md).

### Editor V2 package

Micro-frontend JS bundle (e.g. `editor-canvas`) registered via `elementor/editor/v2/packages` and loaded by `Editor_Loader`.

### Public API

| Symbol | Signature | Purpose |
|--------|-----------|---------|
| `Utils::is_atomic()` | `static is_atomic( $element_instance ): bool` | Detect atomic instance (`utils/utils.php`) |
| `Utils::generate_id()` | `static generate_id( string $prefix, array $existing_ids ): string` | Generate `g-*` style ids |
| `isTransformable()` | `isTransformable( value: unknown ): value is TransformablePropValue` | Check PropValue envelope (`editor-props`) |

## Extension

N/A — add new terms here when a cross-cutting prop type or storage pattern ships.

## Internals

Transformer registration hooks (context selects registry):

- `elementor/atomic-widgets/settings/transformers/register`
- `elementor/atomic-widgets/styles/transformers/register`
- `elementor/atomic-widgets/import/transformers/register`
- `elementor/atomic-widgets/export/transformers/register`

## See also

- [../fundamentals/prop-value.md](../fundamentals/prop-value.md)
- [../fundamentals/prop-types.md](../fundamentals/prop-types.md)
- [../global-classes/data-model.md](../global-classes/data-model.md)
- [../variables/types.md](../variables/types.md)
- [../mcp/composition-workflow.md](../mcp/composition-workflow.md)
