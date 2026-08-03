# CSS Converter Overview

> Audience: both
> Module: `modules/atomic-widgets/css-converter/`
> Related: [pipeline.md](./pipeline.md), [extension.md](./extension.md), [../fundamentals/style-schema.md](../fundamentals/style-schema.md)

## What it is

`Css_Converter` turns a semicolon-separated CSS declaration string into atomic PropValues for the v4 style tree. Shared backend for the REST API, MCP style application, and any caller bridging CSS text to the typed style tree.

```php
$result = $converter->convert( string $css );
// array{ props: array, customCss: string, rejected: string[] }
```

| Key | Meaning |
|-----|---------|
| `props` | PropValues keyed by prop name (e.g. `padding`, `background`) |
| `customCss` | Unconverted declarations for `custom_css` passthrough |
| `rejected` | Declarations routed to `Rejected_Converter` or incompatible variable refs |

`null` (PHP) or `"null"` in input means **reset/delete** that prop. See [extension.md](./extension.md#null--reset-semantics).

## Public API

| Symbol | Signature | Purpose |
|--------|-----------|---------|
| `Css_Converter` | `convert( string $css ): array` | Main entry — parse, expand, convert, optional variable transform |
| `Converter_Registry_Factory` | `create( ?Variables_Service $vars ): Converter_Registry` | Production converter registry |
| `Expander_Registry_Factory` | `create( ?Variables_Service $vars ): Expander_Registry` | Production expander registry |
| `Converter_Registry_Factory` | `covered_properties(): array` | Style_Schema keys the converter claims (CI-checked) |
| `Converter_Registry` | `register( Property_Converter $c ): self` | Add converter (tests / custom wiring) |
| `Expander_Registry` | `register( Shorthand_Expander $e ): self` | Add expander (tests / custom wiring) |

Verified: `css-converter.php`, `converter-registry-factory.php`, `expander-registry-factory.php`, `converter-registry.php`, `expander-registry.php`.

## When to use it

| Caller | How |
|--------|-----|
| REST clients | `POST /wp-json/elementor/v1/css-to-atomic` |
| MCP | `Style_Applier` serializes style maps → `convert()` (`manage-elements`, `build-composition`, `manage-classes`) |
| Contributors | New `Style_Schema` key → add converter + update `covered_properties()` ([extension.md](./extension.md)) |

Production wiring:

```php
$converter = new Css_Converter(
    Converter_Registry_Factory::create( $variables_service ),
    new Null_Failure_Reporter(),
    Expander_Registry_Factory::create( $variables_service ),
    $variables_service ? new Variable_Prop_Value_Transformer( $variables_service ) : null
);
```

Pass `null` for `Variables_Service` when the variables experiment is off — variable promotion and post-conversion validation are skipped.

## Key concepts

**Three output buckets.** Converted props → `props`. No handler or `Noop_Converter` → `customCss`. `Rejected_Converter` or bad variable type → `rejected`. Parse-time blocked properties/values are dropped silently.

**Cascade.** Later declarations for the same property win in `dedupe()`; `Conversion_Context::set_prop()` is last-wins within the converter loop.

**Variables.** With `Variable_Prop_Value_Transformer`, `var(--label)` tokens resolve to typed variable PropValues; unresolvable refs eject to `customCss` or `rejected`. Use label-only refs: `var(--wc26-gold)`.

## Extension

See [extension.md](./extension.md).

## Internals

| | |
|---|---|
| Route | `POST /wp-json/elementor/v1/css-to-atomic` |
| Permission | `edit_posts` |
| Body | `{ "blocks": { "<name>": "<css>" \| { "<prop>": "<value>" \| null } } }` |

`Css_Converter_REST_API` registers on `rest_api_init` from `modules/atomic-widgets/module.php`. REST always wires `Variables_Service` when variables + atomic experiments are active.

`Style_Applier` (`modules/mcp/abilities/appliers/style-applier.php`) converts property maps to CSS, calls `convert()`, merges `props` and `customCss` into a local style variant. Rejected variables fail the request.

## See also

- [pipeline.md](./pipeline.md) — stage diagram
- [extension.md](./extension.md) — expanders and converters
- [../mcp/composition-workflow.md](../mcp/composition-workflow.md)
- [../variables/usage-in-styles.md](../variables/usage-in-styles.md)
