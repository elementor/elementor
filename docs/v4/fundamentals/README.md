# Fundamentals

> Status: final

## Purpose

Shared contracts for every v4 module — prop values, prop types, style schema, transformers, and validation. Read this section **before any module-specific docs**; all other `docs/v4/` folders assume familiarity with these concepts.

## Files

| File | Covers |
|------|--------|
| [prop-value.md](prop-value.md) | `{ $$type, value }` envelope; `disabled`; null/reset; overridable wrapping |
| [prop-types.md](prop-types.md) | Taxonomy (plain, object, array, union); domain types; PHP ↔ TS mapping; `props-schema` hook |
| [style-schema.md](style-schema.md) | Canonical CSS keys in `Style_Schema`; dependencies; breakpoint variants; variable unions |
| [transformers.md](transformers.md) | Registry contexts (settings, styles, import, export); registration hooks; render depth |
| [validation.md](validation.md) | `Props_Parser` (PHP); `validatePropValue` (TS); partial-null bypass; LLM JSON schema export |

## Reading order

1. [prop-value.md](prop-value.md) — the atomic unit stored in element JSON
2. [prop-types.md](prop-types.md) — how values are typed and validated
3. [style-schema.md](style-schema.md) — the canonical style prop vocabulary
4. [transformers.md](transformers.md) — how typed values become render output
5. [validation.md](validation.md) — server and client validation, plus LLM schema export

## Related

- [../getting-started/glossary.md](../getting-started/glossary.md) — terminology (PropValue, label vs id, overridable)
- [../atomic-widgets/authoring-widgets.md](../atomic-widgets/authoring-widgets.md) — widget `define_props_schema()`
- [../atomic-widgets/hooks.md](../atomic-widgets/hooks.md) — full `elementor/atomic-widgets/*` hook catalog
- [../editor-packages/libs.md](../editor-packages/libs.md) — `@elementor/editor-props` package overview
- [../css-converter/overview.md](../css-converter/overview.md) — CSS → PropValue conversion (uses validation bypass)
