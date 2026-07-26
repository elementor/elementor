# Validation

> Audience: both
> Module: atomic-widgets
> Status: draft
> Related: [prop-value.md](prop-value.md), [prop-types.md](prop-types.md), [../css-converter/overview.md](../css-converter/overview.md), [../mcp/abilities/get-widget-schema.md](../mcp/abilities/get-widget-schema.md)

## What it is

v4 validates PropValues at two layers:

1. **PHP** — `Props_Parser` walks a schema map and delegates to each prop type's `validate()` / `sanitize()`
2. **TS** — `validatePropValue()` in `@elementor/editor-props` validates against JSON Schema derived from prop types

Both assume the `{ $$type, value }` contract. LLM/agent flows additionally export JSON Schema via `to_json_schema()` (PHP) and `propTypeToJsonSchema()` (TS), filtered for agent consumption.

## When to use it

- Server-side save/REST/MCP payloads before persisting element data
- Client-side editor validation before committing control changes
- CSS converter post-processing (`validate_props` step)
- Building or debugging MCP widget schemas (`get-widget-schema`)

## Key concepts

### PHP `Props_Parser`

Location: `modules/atomic-widgets/parsers/props-parser.php`

```php
$parser = Props_Parser::make( $schema ); // map of key => Prop_Type

$result = $parser->validate( $props );   // Parse_Result; errors keyed by prop name
$result = $parser->sanitize( $props );   // strips non-persistable values
$result = $parser->parse( $props );        // validate then sanitize; merged errors
```

Behavior:

- Unknown schema keys are ignored; missing keys use prop type default for validation
- `null` value for a key → valid if not required; omitted from validated output
- Invalid prop → `errors()->add( $key, 'invalid_value' )`; key skipped in output
- `sanitize()` calls `should_persist()` — empty object/array props are dropped; plain props with empty string are kept

Used by atomic widget save paths, components overridable parsers, and CSS converter validation.

### JS `validatePropValue`

Location: `packages/packages/libs/editor-props/src/utils/validate-prop-value.ts`

```ts
import { validatePropValue, validatePropValueDetailed } from '@elementor/editor-props';

const { valid, errors, errorMessages, jsonSchema } = validatePropValue( propType, value );
```

- Builds JSON Schema via `propTypeToJsonSchema( schema )`
- Validates with `jsonschema` npm package
- **`null` bypass** — if `value === null`, returns `{ valid: true }` without schema check (explicit reset allowed)
- `validatePropValueDetailed()` adds nested `anyOf` variant diagnostics for union types

Exported from `@elementor/editor-props` as `Schema.validatePropValue` and top-level `validatePropValue`.

### Partial-null bypass

When validating CSS-converter output, `Css_Converter::validate_props()` splits props:

- **Null resets** — top-level `null` or any object prop whose `value` tree contains a `null` leaf (`has_null_leaf()`)
- **Value props** — everything else → `Props_Parser::validate()`

Partial-null object props **bypass** strict parser validation so intentional per-field resets survive. After validation, `cleanup_props()` collapses objects where all present sub-values are `null` into a single top-level `null`.

This bypass is specific to the CSS converter pipeline — general save paths use `Props_Parser` directly without the split. See [../css-converter/overview.md](../css-converter/overview.md).

### LLM JSON schema export

Two parallel paths converge on agent-facing schema:

**PHP**

- Each `Prop_Type::to_json_schema()` — envelope with `$$type` const + `value` shape
- `Union_Prop_Type` → `{ anyOf: [ … ] }`
- Widget MCP schema: `Widget_Context_Helper::build_configurable_properties_schema()` calls `to_json_schema()` per prop, then:

```php
apply_filters( 'elementor/atomic-widgets/llm-json-schema', $schema );
Plain_Llm_Schema_Converter::convert( $filtered );
```

Filter registered by dynamic-tags (`LLM_Schema_Dedupe_Filter`), components (`Overridable_Llm_Filter`), and extensible by addons.

**TS**

- `propTypeToJsonSchema( propType )` — mirrors PHP structure; adds dynamic tag `name` enum when host injects `setDynamicTagNamesResolver()`
- `Schema.adjustLlmPropValueSchema()` — normalizes agent-produced values before save
- `validatePropValue` round-trips against the same schema

**`llm_guidance`** — separate from JSON Schema; built by `Llm_Guidance_Builder` in MCP widget context (`default_settings`, nesting hints, etc.). See [../mcp/abilities/get-widget-schema.md](../mcp/abilities/get-widget-schema.md). Not emitted by `to_json_schema()` itself.

Live widget schemas: prefer MCP `get-widget-schema` over static docs (per plan §8).

## Extension

### Custom validation for a prop type

Override `validate_value()` / `sanitize_value()` on your prop type class. For cross-cutting rules, wrap `Props_Parser` at your REST/MCP entry point.

### Customize LLM schema

```php
add_filter( 'elementor/atomic-widgets/llm-json-schema', function ( array $schema ) {
    // Adjust JSON Schema fragment for a prop type
    return $schema;
} );
```

TS: extend `propTypeToJsonSchema` consumers or add meta fields read by the converter.

## Internals

| Symbol | Location |
|--------|----------|
| `Props_Parser` | `parsers/props-parser.php` |
| `Parse_Result` | `Core\Utils\Api\Parse_Result` |
| `validatePropValue` | `editor-props/src/utils/validate-prop-value.ts` |
| `propTypeToJsonSchema` | `editor-props/src/utils/props-to-llm-schema.ts` |
| `Plain_Llm_Schema_Converter` | `prop-types/utils/plain-llm-schema-converter.php` |
| `Css_Converter::validate_props()` | `css-converter/css-converter.php` |
| `elementor/atomic-widgets/llm-json-schema` | Filter hook (exact string verified in `widget-context-helper.php`) |

PHP `Plain_Prop_Type::validate()` treats empty `value` as valid for non-required props. Union types dispatch validation to the member matching `$$type`.

## See also

- [prop-value.md](prop-value.md) — null vs `disabled` semantics
- [prop-types.md](prop-types.md) — `validate()` on prop types
- [style-schema.md](style-schema.md) — schema used by style validation
- [../css-converter/pipeline.md](../css-converter/pipeline.md) — full converter validation step
