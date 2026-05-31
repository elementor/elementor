---
title: Atomic Widgets Prop Types
tags: [prop-types, atomic-widgets, dynamic-tags, llm, mcp, editor-props, schema, union]
domain: elementor-v4
audience: agents
scope: [PHP modules/atomic-widgets, packages/libs/editor-props, editor-editing-panel/dynamics, editor-canvas/mcp]
related_rules: [.cursor/rules/core-development.mdc, .cursor/rules/graphify.mdc]
last_reviewed: 2026-05-28
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
  → propTypeToLlmJsonSchema()        # base schema + LLM schema dialect adapters + cleanup
  → [styles resource only] enrichWithIntention()   # adds required $intention string; NOT in converter

LLM wire payload
  → validateLlmJson(propType, wire)  # jsonschema against LLM schema
  → validateLlmSemantic()            # stub today (always valid)
  → propValuesFromLlm() / Schema.propFromLlm
        → LLMDialectAdapter.toPropValue()   # bindTo, size flatten, …
        → adjustLlmPropValueSchema()        # transitional: forceKey, globals transformers, strip $intention
  → persist PropValue
```

**Important:** MCP gates (`validate-input.ts`, `do-update-element-property.ts`, global-classes MCP) validate **LLM wire** with `validateLlmJson`. They do **not** call `validatePropValue` on agent input before conversion.

### Outbound pipeline (read back to agent)

```
stored PropValue
  → propValuesToLlm() / Schema.propToLlm
  → LLMDialectAdapter.toDialectValue() tree walk (flat size, bindTo expansion, …)
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

## LLM dialect (`llm-dialect/` + `props-to-llm-schema.ts`)

### Entry points

| API | Role |
|-----|------|
| `propTypeToJsonSchema(propType)` | Canonical PropValue JSON Schema; used by `validatePropValue` |
| `propTypeToLlmJsonSchema(propType, context?)` | Same walk + `LLMDialectAdapter.toDialectSchema` + schema cleanup |
| `initLlmDialect()` | Registers adapters once; called from editor-canvas init + `ensureLlmDialect()` on demand |

Base conversion still **skips** `dynamic` and `overridable` union members when a dialect adapter is active (`convertUnionPropType` in `props-to-llm-schema.ts`).

### Registry design (`llm-prop-schema.ts`)

Two extension mechanisms:

1. **Schema dialect adapters** — `registerSchemaDialect({ id, matches(propType), toDialectSchema })`
   - Matched by **predicate** on `PropType`, not only `$$type` key.
   - Composed in registration order; **`registerSchemaCleanup` runs last** (unwrap single-branch `oneOf`/`anyOf`, merge descriptions only).

2. **Value adapters**
   - **Global chain** — `registerGlobalValueAdapter` (e.g. `bindTo` ↔ `dynamic`).
   - **Per-`$$type` chain** — `register('size', …)`.

Init order (`llm-dialect/init.ts`): **dynamic → html-v3 → size → cleanup**.

### Registered dialects (current)

| ID | Trigger | Schema effect | Value effect |
|----|---------|---------------|--------------|
| `union-dynamic` | Union includes `dynamic` | Adds optional `bindTo` on static `anyOf` branches when `allowBindTo: true` (root only; nested unions pass `allowBindTo: false`) | Global: `bindTo` string → `$$type: dynamic` with fallback; `dynamic` → dialect with `bindTo` |
| `html-v3` | `propType.key === 'html-v3'` | Strips `dynamic` from nested `content` union; no `bindTo` on nested unions | Fallback shape helpers in `html-v3-dynamic-fallback.ts` (used from dynamic adapter) |
| `size` | `key` is `size` or `grid-track-size` | Flattens inner `value` to `{ unit, size }` (flat primitives in schema) | `canonicalizeSizePropValue`: flat LLM ↔ nested canonical storage |
| *(cleanup)* | Always last | Unwraps single-branch combinators | — |

### `bindTo` (Idea C)

Agent wire:

```json
{ "$$type": "string", "value": "Hello", "bindTo": "post-title" }
```

→ `toPropValue` → stored `{ "$$type": "dynamic", "value": { "name", "group", "settings": { "fallback": … } } }`.

Outbound `propToLlm` expands `dynamic` back to static branch + `bindTo`.

### Size shape mismatch (intentional)

- **Canonical PropValue** (storage): nested transformables inside `value.unit` / `value.size`.
- **LLM dialect**: flat `{ unit: "px", size: 16 }` inside `value`.
- Adapters + `size-canonical-shape.ts` convert at the boundary. Do not validate LLM flat size with canonical schema.

### `enrichWithIntention` / `$intention` (styles only)

- **`enrichWithIntention(schema, text)`** — caller-only; used on **per-category styles MCP resource** after `propTypeToLlmJsonSchema`. Adds required top-level `$intention` string (“Desired CSS in format property: value;”).
- **Not** part of `propTypeToLlmJsonSchema` or widget schemas.
- **`$intention` is not a stored prop.** Stripped in `adjustLlmPropValueSchema` before persist.
- **Build-compositions recovery:** if style props fail `validateLlmJson` but `$intention` is present, `CompositionBuilder` merges `$intention` CSS with explicit `customCSS` param and writes once as `custom_css`. `doUpdateElementProperty` merges new `custom_css` with any existing local variant CSS (`merge-custom-css.ts`).

### `adjustLlmPropValueSchema` — transitional (still called)

Runs **after** `LLMDialectAdapter.toPropValue` inside `propValuesFromLlm`. Still handles:

- Strip `$intention`
- `forceKey` disambiguation
- Global variable transformers (`globalVariablesLLMResolvers`)
- Residual size/html-v3 paths overlapping dialect adapters

**Do not add new behavior here** — register schema/value adapters instead. Remove when MCP paths no longer depend on it.

### `validateLlmSemantic`

Exported and wired in API; **implementation is a stub** (always `{ valid: true }`). Reserved for post-JSON checks (e.g. bindTo tag exists, semantic CSS).

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
7. **New dialect features:** `registerSchemaDialect` / `register` / `registerGlobalValueAdapter` in `llm-dialect/` — not union-loop hacks or `adjust`.
8. **Tests:** `packages/packages/libs/editor-props/src/llm-dialect/__tests__/`; editor-canvas MCP utils tests.

---

## Module map (implemented)

```
packages/packages/libs/editor-props/src/
  utils/props-to-llm-schema.ts       # propTypeToJsonSchema / propTypeToLlmJsonSchema, enrichWithIntention
  utils/prop-values-from-llm.ts      # propValuesFromLlm
  utils/prop-values-to-llm.ts        # propValuesToLlm
  utils/adjust-llm-prop-value-schema.ts   # transitional post-conversion
  utils/validate-prop-value.ts       # canonical validation (not LLM wire)
  llm-dialect/
    llm-prop-schema.ts               # LLMDialectAdapter registry
    init.ts                          # initLlmDialect registration order
    validate-llm-dialect.ts          # validateLlmJson, validateLlmSemantic (stub)
    register-dynamic-prop-type-llm-dialect-adapter.ts
    register-html-v3-llm-dialect-adapter.ts
    register-size-llm-dialect-adapter.ts
    cleanup-llm-json-schema.ts
    size-canonical-shape.ts
    html-v3-dynamic-fallback.ts
    dynamic-tag-metadata-registry.ts

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
