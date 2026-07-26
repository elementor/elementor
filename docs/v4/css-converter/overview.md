# CSS Converter Overview

> Audience: both
> Module: `modules/atomic-widgets/css-converter/`
> Status: draft
> Related: [pipeline.md](./pipeline.md), [extension.md](./extension.md), [../fundamentals/style-schema.md](../fundamentals/style-schema.md)

## What it is

`Css_Converter` turns a semicolon-separated CSS declaration string into atomic PropValues ready to merge into a v4 style variant. It is the shared backend for the editor REST API, MCP style application, and any caller that needs to bridge “CSS text” and the typed style tree.

Entry point:

```php
Css_Converter::convert( string $css ): array
```

Return shape:

| Key | Type | Meaning |
|-----|------|---------|
| `props` | `array` | Style-schema PropValues keyed by prop name (e.g. `padding`, `background`) |
| `customCss` | `string` | Declarations that could not be converted, joined for passthrough to `custom_css` |
| `rejected` | `string[]` | Structurally invalid declarations (e.g. unknown variable with wrong type, `animation` longhands) |

`null` (PHP) or the string `"null"` in input means **reset/delete** that prop in the style tree. See [extension.md](./extension.md#null--reset-semantics).

## When to use it

- **Editor / REST clients** — batch-convert CSS blocks via `POST /wp-json/elementor/v1/css-to-atomic`.
- **MCP integrators** — `manage-elements` and `build-composition` pass property maps through `Style_Applier`, which serializes them to CSS and calls `Css_Converter::convert()`.
- **Contributors** — when adding a new `Style_Schema` key, wire a converter and update `Converter_Registry_Factory::covered_properties()` (see [extension.md](./extension.md)).

Construct the converter the same way production callers do:

```php
$variables_service = /* Variables_Service or null */;
$converter = new Css_Converter(
    Converter_Registry_Factory::create( $variables_service ),
    new Null_Failure_Reporter(),
    Expander_Registry_Factory::create( $variables_service ),
    $variables_service ? new Variable_Prop_Value_Transformer( $variables_service ) : null
);
```

When the variables experiment is inactive, pass `null` for `Variables_Service` and the variable transformer; variable promotion and post-conversion validation are skipped in that case.

## Key concepts

**Three output buckets.** Converted props land in `props`. Unsupported or declined rules become `customCss` (verbatim fallback). Rules handled by `Rejected_Converter` (e.g. `animation*`) go to `rejected` so clients can surface explicit errors to LLMs.

**Cascade at rule level.** Within a single `convert()` call, later declarations for the same property name win during `dedupe()`, and converters write into a shared `Conversion_Context` where `set_prop()` also last-wins.

**Variable-aware path.** When `Variable_Prop_Value_Transformer` is injected, the pipeline resolves `var(--label)` tokens to typed variable PropValues, ejects unresolvable references, and runs `Props_Parser` validation against `Style_Schema`. Without it, conversion still runs but skips those steps.

## Extension

N/A — see [extension.md](./extension.md) for registering expanders and converters.

## Internals

**REST endpoint** — `Css_Converter_REST_API` registers on `rest_api_init` from `modules/atomic-widgets/module.php`.

| | |
|---|---|
| Route | `POST /wp-json/elementor/v1/css-to-atomic` |
| Permission | `edit_posts` |
| Body | `{ "blocks": { "<name>": "<css string>" \| { "<property>": "<value>" \| null } } }` |

Each block name maps to `{ props, customCss, rejected }`. String values are parsed as CSS text; object values are serialized to declarations (null values become `property: null;` resets). The REST layer always wires `Variables_Service` when the variables + atomic experiments are active.

**MCP style applier** — `manage-elements-ability.php` builds a converter via `create_css_converter()` and passes it to `Style_Applier` when the `style` parameter is present on an element update:

```php
$style_applier = new Style_Applier( $this->create_css_converter( $variables_service ) );
$style_result = $style_applier->apply( $index, [ $element_id => $style ] );
```

`Style_Applier` (`modules/mcp/abilities/build-composition/style-applier.php`) converts each element's property map to CSS, calls `convert()`, then merges `props` and `customCss` into a local style variant on the element. Rejected variable usage fails the request; `customCss` fallbacks emit warnings (notably for Pro 3.35+ `custom_css` rendering). The same `Style_Applier` pattern is used by `build-composition-ability.php`.

**Source layout** — `css-converter.php` (orchestrator), `converter-registry-factory.php` / `expander-registry-factory.php` (registration), `converters/`, `expanders/`, `variable-prop-value-transformer.php`.

## See also

- [pipeline.md](./pipeline.md) — full stage diagram
- [extension.md](./extension.md) — extend expanders and converters
- [../mcp/composition-workflow.md](../mcp/composition-workflow.md) — end-to-end agent composition
- [../variables/usage-in-styles.md](../variables/usage-in-styles.md) — label-only `var(--wc26-gold)` convention
