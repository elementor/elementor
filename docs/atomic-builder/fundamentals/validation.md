# Validation

> Audience: both
> Module: atomic-widgets
> Related: [prop-value.md](prop-value.md), [prop-types.md](prop-types.md), [../css-converter/overview.md](../css-converter/overview.md), [../mcp/abilities/get-widget-schema.md](../mcp/abilities/get-widget-schema.md)

## What it is

v4 validates PropValues at two layers:

1. **PHP** — `Props_Parser` walks a schema map, delegates to each prop type's `validate()` / `sanitize()`
2. **TS** — `validatePropValue()` in `@elementor/editor-props` validates against JSON Schema from prop types

Both assume the `{ $$type, value }` contract. LLM flows also export JSON Schema via `to_json_schema()` (PHP) and `propTypeToJsonSchema()` (TS).

## When to use it

- Server-side save/REST/MCP payloads before persist
- Client-side editor validation before committing changes
- CSS converter post-processing (`validate_props`)
- Building MCP widget schemas (`get-widget-schema`)

## Key concepts

### PHP `Props_Parser`

```php
$parser = Props_Parser::make( $schema );
$result = $parser->validate( $props );   // Parse_Result; errors keyed by prop name
$result = $parser->sanitize( $props );   // strips non-persistable values
$result = $parser->parse( $props );      // validate then sanitize
```

| Behavior | Detail |
|----------|--------|
| Unknown keys | Ignored |
| Missing keys | Use prop type default for validation |
| `null` value | Valid if not required; omitted from output |
| Invalid prop | `errors()->add( $key, 'invalid_value' )`; key skipped |

Used by save paths, components parsers, and CSS converter validation.

### JS `validatePropValue`

```ts
import { validatePropValue } from '@elementor/editor-props';
const { valid, errors, errorMessages, jsonSchema } = validatePropValue( propType, value );
```

- Builds JSON Schema via `propTypeToJsonSchema( propType )`
- Validates with `jsonschema` npm package
- **`null` bypass** — `value === null` returns `{ valid: true }` (explicit reset)

### Partial-null bypass (CSS converter only)

`Css_Converter::validate_props()` splits props:

- **Null resets** — top-level `null` or object with `null` leaf (`has_null_leaf()`)
- **Value props** — everything else → `Props_Parser::validate()`

Partial-null props bypass strict validation so per-field resets survive. `cleanup_props()` collapses all-null objects to top-level `null`.

### LLM JSON schema export

**PHP** — `Prop_Type::to_json_schema()` per prop; filtered via `elementor/atomic-widgets/llm-json-schema`; converted by `Plain_Llm_Schema_Converter`.

**TS** — `propTypeToJsonSchema()`, `Schema.adjustLlmPropValueSchema()` for agent-produced values.

**`llm_guidance`** — sibling field on MCP widget schema root (not part of `to_json_schema()`). Built by `Llm_Guidance_Builder`.

Prefer live MCP `get-widget-schema` over static docs.

### Public API

| Symbol | Signature | Purpose |
|--------|-----------|---------|
| `Props_Parser::make()` | `static make( array $schema ): self` | Create parser (`props-parser.php`) |
| `Props_Parser::validate()` | `validate( array $props ): Parse_Result` | Schema validation |
| `Props_Parser::parse()` | `parse( array $props ): Parse_Result` | Validate + sanitize |
| `validatePropValue()` | `validatePropValue( schema, value )` | Client validation (`validate-prop-value.ts`) |
| `propTypeToJsonSchema()` | `propTypeToJsonSchema( propType, suppressDynamic? )` | Build JSON Schema (`props-to-llm-schema.ts`) |
| `Schema.validatePropValue` | same as above | Namespace export on `Schema` object |
| `Prop_Type::to_json_schema()` | `to_json_schema(): array` | PHP JSON Schema per prop type |
| `Plain_Llm_Schema_Converter::convert()` | `convert( array $schema ): array` | Simplify schema for LLMs |

## Extension

### Custom validation

Override `validate_value()` / `sanitize_value()` on your prop type. For cross-cutting rules, wrap `Props_Parser` at your entry point.

### Customize LLM schema

```php
add_filter( 'elementor/atomic-widgets/llm-json-schema', function ( array $schema ) {
    return $schema;
} );
```

## Internals

`Parse_Result` from `Core\Utils\Api\Parse_Result`. Union types dispatch validation to the member matching `$$type`. `Plain_Prop_Type::validate()` treats empty `value` as valid for non-required props.

## See also

- [prop-value.md](prop-value.md)
- [prop-types.md](prop-types.md)
- [style-schema.md](style-schema.md)
- [../css-converter/pipeline.md](../css-converter/pipeline.md)
