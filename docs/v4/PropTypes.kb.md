---
title: Atomic Widgets Prop Types
tags: [prop-types, atomic-widgets, dynamic-tags, llm, mcp, editor-props, schema, union]
domain: elementor-v4
audience: agents
scope: [PHP modules/atomic-widgets, packages/libs/editor-props, editor-editing-panel/dynamics, editor-canvas/mcp]
related_rules: [.cursor/rules/core-development.mdc, .cursor/rules/graphify.mdc]
last_reviewed: 2026-06-02
annotations:
  - "prop-types" here means Elementor atomic $$type/value props — NOT the React npm package "prop-types".
  - Dynamic prop values = live/context data via Elementor dynamic tags (post title, featured image URL, etc.), not literals or globals.
  - LLM JSON schema omits `dynamic` / `overridable` union branches; agents bind via `bindTo` on static branches where the prop is bindable.
  - LLM wire validation uses `validateLlmJson` + `propTypeToLlmJsonSchema` — not canonical `validatePropValue` on agent input.
  - New concrete props usually need paired PHP class + TS createPropUtils() with the same key.
  - Use graphify query on this topic only after graphify-out/graph.json exists; otherwise grep paths below.
---

# Prop Types — Agent Knowledge Base

## PropType vs PropValue vs LLM dialect

| Concept | Role | Analogy |
|---------|------|---------|
| **PropType** | Definition (PHP → `atomic_props_schema`) | JSON Schema |
| **PropValue** | Stored / editor instance (`$$type` + `value`, canonical shape) | JSON (canonical) |
| **LLM dialect** | Agent wire instance (flat size, `bindTo`, optional `$intention`, etc.) | JSON (dialect) |

**Zod:** `createPropUtils(key, zodSchema)` validates **canonical PropValue** after conversion. Do not validate raw LLM wire input with Zod/`validatePropValue`.

### Inbound pipeline (MCP / agent write)

```
PropType
  → propTypeToLlmJsonSchema()        # tree walk; adapter toDialectSchema + final cleanup
  → [styles resource only] enrichWithIntention()   # adds required $intention string; NOT in converter

LLM wire payload
  → validateLlmJson(propType, wire)  # jsonschema against LLM schema
  → validateLlmSemantic()            # stub today (always valid)
  → propFromLlm() / propValuesFromLlm()   # tree walk; adapter toPropValue
  → persist canonical PropValue
```

**Important:** MCP gates (`validate-input.ts`, `do-update-element-property.ts`, global-classes MCP) validate **LLM wire** with `validateLlmJson`. They do **not** call `validatePropValue` on agent input before conversion.

### Outbound pipeline (read back to agent)

```
stored PropValue
  → propToLlm() / propValuesToLlm()   # tree walk; adapter toDialectValue
```

---

## What this is

V4 atomic elements store settings as **typed prop values**:

```json
{ "$$type": "<key>", "value": <payload>, "disabled?": boolean }
```

- **PHP**: classes under `modules/atomic-widgets/prop-types/` implementing `Prop_Type` / `Transformable_Prop_Type`.
- **TS**: `@elementor/editor-props` — `createPropUtils(key, zodSchema)` in `packages/packages/libs/editor-props/`.
- Keys must match across PHP and TS (e.g. `string`, `color`, `size`, `dynamic`).

**Not in scope:** React `import PropTypes from 'prop-types'` in legacy `modules/*/assets/js` — unrelated system.

---

## Core definitions (read first)

| Layer | Role | Path |
|-------|------|------|
| PHP contract | `validate`, `sanitize`, `get_key`, meta/settings | `modules/atomic-widgets/prop-types/contracts/prop-type.php` |
| PHP transformable | `generate()` for `$$type`/`value` | `modules/atomic-widgets/prop-types/contracts/transformable-prop-type.php` |
| PHP union | multiple `$$type` variants | `modules/atomic-widgets/prop-types/union-prop-type.php` |
| TS value types | `TransformablePropValue`, `PropsSchema` | `packages/packages/libs/editor-props/src/types.ts` |
| TS factory | `createPropUtils`, `createArrayPropUtils` | `packages/packages/libs/editor-props/src/utils/create-prop-utils.ts` |
| Widget schema source | `define_props_schema()` → filter → editor config | `modules/atomic-widgets/elements/base/has-atomic-base.php` |
| Public Schema API | `Schema.propTypeToLlmJsonSchema`, `propFromLlm`, `validateLlmJson`, … | `packages/packages/libs/editor-props/src/index.ts` |

Schema extension pattern: `Prop_Types_Schema_Extender` wraps a prop in a union and adds members — `modules/atomic-widgets/prop-types/utils/prop-types-schema-extender.php`.

---

## Dynamic prop types

### What they're for

**Purpose:** Context-driven data (Elementor **dynamic tags**) inside the same `$$type` / `value` model as static settings.

**Stored reference (not the resolved string):**

```json
{ "$$type": "dynamic", "value": { "name": "post-title", "group": "post", "settings": { "fallback": <PropValue> } } }
```

Resolution: editor preview → `dynamic-transformer.ts` + `window.elementor.dynamicTags`; frontend render → `Dynamic_Transformer` (PHP).

### Injection (runtime / editor schema)

```
define_props_schema()
  → apply_filters( 'elementor/atomic-widgets/props-schema' )
  → Dynamic_Prop_Types_Mapping (optional union + dynamic)
```

| File | Purpose |
|------|---------|
| `modules/atomic-widgets/dynamic-tags/dynamic-prop-types-mapping.php` | Category mapping |
| `modules/atomic-widgets/dynamic-tags/dynamic-prop-type.php` | Class, validation, `ignore()` meta |
| `packages/packages/core/editor-editing-panel/src/dynamics/` | Editor helpers + client preview |

Tag catalog for LLM bindTo resolution: `atomicDynamicTags.tags` — wired into dialect via `initLlmDialect({ resolveDynamicTags })` in `editor-canvas/src/init.tsx`.

---

## LLM dialect (`llm-dialect/`)

**Purpose:** bridge the complex canonical PropType/PropValue model with a simple, LLM-friendly JSON shape. The dialect is a synchronous, bidirectional, pure tree walk over the PropType. Each concern is one **adapter** that can optionally:

- `toDialectSchema` — reshape the JSON schema the agent sees.
- `toPropValue` — convert inbound LLM JSON → canonical PropValue.
- `toDialectValue` — convert stored PropValue → LLM JSON.

**Entry point:** `initLlmDialect()` (`llm-dialect/init.ts`) registers the built-in adapters once (called from editor-canvas init; `ensureLlmDialect()` on demand). Public surface is the `Schema.*` facade in `editor-props/src/index.ts` — `propTypeToLlmJsonSchema`, `propFromLlm`, `propToLlm`, `validateLlmJson`.

Adapters live under `llm-dialect/adapters/` (one per concern: dynamic, html-v3, image-src, overridable, size), each gated by a `matches(ctx)` predicate on the PropType. They run in registration order, then a final cleanup pass simplifies the schema. **To add or change behavior, add/extend an adapter** — do not special-case the walk or callers.

Agent-facing shapes (see checklist): bindable props use `bindTo` on the static branch (converted to `$$type: dynamic` on write, expanded back on read); `size` is flat `{ unit, size }`.

### `enrichWithIntention` / `$intention` (styles only)

- **`enrichWithIntention(schema, text)`** — caller-only; used on the **per-category styles MCP resource** after `propTypeToLlmJsonSchema`. Adds a required top-level `$intention` string. Not part of the dialect or widget schemas, and not a stored prop.
- **Build-compositions recovery:** if style props fail `validateLlmJson` but `$intention` is present, `CompositionBuilder` merges `$intention` CSS with the explicit `customCSS` param and writes once as `custom_css`. Explicit `custom_css` writes replace stored CSS (default `customCssWriteMode: 'replace'` in `doUpdateElementProperty`).

### `validateLlmSemantic`

Exported and wired in the API; **implementation is a stub** (always `{ valid: true }`). Reserved for post-JSON checks (e.g. bindTo tag exists, semantic CSS).

---

## MCP integration (`editor-canvas`)

| Concern | Implementation |
|---------|----------------|
| Dialect init | `editor-canvas/src/init.tsx` → `initLlmDialect({ resolveDynamicTags: () => getElementorConfig()?.atomicDynamicTags?.tags })` |
| Widget LLM schemas | `widgets-schema-resource.ts` → `Schema.propTypeToLlmJsonSchema` per configurable prop |
| Style LLM schemas | Same + `Schema.enrichWithIntention(..., 'Desired CSS in format "property: value;"')` |
| Pre-flight validation | `validate-input.ts` → `validateLlmJson` |
| Persist | `do-update-element-property.ts` → `validateLlmJson` on wire → `Schema.propFromLlm` → `updateElementSettings` / `updateElementStyle` |
| Global classes MCP | `mcp-manage-global-classes.ts` → `validateLlmJson` then `propFromLlm` |
| Build compositions | `CompositionBuilder` validates styles/props via `validateInput`; applies `$intention` + `customCSS` merge |

Tools: `configure-element`, `build-compositions`, `get-element-config` (`propToLlm` on read).

---

## Other extensions

| Extension | Notes |
|-----------|-------|
| Variables | `global-*-variable` union members — included in LLM schema |
| Components | `overridable` union member — **omitted** from LLM schema (no dialect yet) |
| Style schema | `modules/atomic-widgets/styles/style-schema.php`; dynamics on color-bearing props |

---

## End-to-end flows

### A) Schema to editor

```
PHP define_props_schema()
  → filters + Dynamic_Prop_Types_Mapping
  → atomic_props_schema in editor config
  → TS editor / controls
```

### B) Agent write (MCP)

```
Read MCP resource (propTypeToLlmJsonSchema [+ enrichWithIntention for styles])
  → agent produces LLM wire JSON
  → validateLlmJson
  → propFromLlm (dialect + adjust)
  → persist canonical PropValue
```

### C) Agent read

```
stored PropValue → propToLlm → MCP response / get-element-config
```

### D) Save to render (dynamic)

```
{ $$type: dynamic, value: { name, group, settings } }
  → Render_Props_Resolver → Dynamic_Transformer (PHP) → V1 Dynamic Tags Manager
```

---

## Agent checklist

1. **Search** `modules/atomic-widgets/prop-types/` and `packages/packages/libs/editor-props/src/prop-types/` before adding types.
2. **Pair PHP + TS** with identical keys.
3. **Unions:** editor has `dynamic`; LLM schema exposes static branches + optional **`bindTo`**, not `$$type: dynamic`.
4. **Validate agent input** with `validateLlmJson` + LLM schema resources — **not** `validatePropValue` on wire payloads.
5. **Size / html-v3:** use dialect shapes from MCP schema; expect conversion on `propFromLlm`.
6. **Styles `$intention`:** describe fallback CSS when structured props may fail; may land in `custom_css` after build-compositions recovery.
7. **New dialect features:** add or extend an adapter under `llm-dialect/adapters/` (registered in `register-built-in-adapters.ts`) — not union-loop hacks or walk/caller special-casing.
8. **Tests:** `packages/packages/libs/editor-props/src/llm-dialect/__tests__/`; editor-canvas MCP utils tests.

---

## Module map (implemented)

```
packages/packages/libs/editor-props/src/
  utils/props-to-llm-schema.ts       # propTypeToJsonSchema / propTypeToLlmJsonSchema, enrichWithIntention
  utils/prop-values-from-llm.ts      # propValuesFromLlm (toProp tree walk)
  utils/prop-values-to-llm.ts        # propValuesToLlm (toDialect tree walk)
  utils/validate-prop-value.ts       # canonical validation (not LLM wire)
  llm-dialect/
    init.ts                          # initLlmDialect — entry point
    register-built-in-adapters.ts    # registration order
    registry.ts                      # PropDialectAdapter contract + apply/finalize
    walk.ts                          # PropType tree walk (both directions)
    validate-llm-dialect.ts          # validateLlmJson, validateLlmSemantic (stub)
    cleanup-llm-json-schema.ts       # final schema simplify pass
    dynamic-tag-metadata-registry.ts # bindTo tag catalog
    adapters/                        # dynamic, html-v3, image-src, overridable, size

packages/packages/core/editor-canvas/src/
  init.tsx                           # initLlmDialect + MCP
  mcp/resources/widgets-schema-resource.ts
  mcp/utils/validate-input.ts
  mcp/utils/do-update-element-property.ts
  mcp/utils/merge-custom-css.ts
  composition-builder/composition-builder.ts

packages/packages/core/editor-global-classes/src/mcp-integration/mcp-manage-global-classes.ts
```

---

## Quick file index (PHP + packages)

```
modules/atomic-widgets/prop-types/
modules/atomic-widgets/dynamic-tags/
modules/atomic-widgets/elements/base/
packages/packages/libs/editor-props/
packages/packages/core/editor-editing-panel/src/dynamics/
packages/packages/core/editor-canvas/src/mcp/
```
