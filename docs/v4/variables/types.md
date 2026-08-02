# Variable types

> Audience: both
> Module: `modules/variables/classes/variable-types-registry.php`, `modules/variables/hooks.php`
> Related: [usage-in-props.md](./usage-in-props.md), [../fundamentals/prop-types.md](../fundamentals/prop-types.md), [../fundamentals/transformers.md](../fundamentals/transformers.md)

## What it is

A **variable type** is a `Transformable_Prop_Type` registered in `Variable_Types_Registry`. The type key (e.g. `global-color-variable`) drives validation, storage, style-schema unions, and render transformers.

New types are added via `elementor/variables/register` — built-in color/font/size are examples, not a closed list.

## When to use it

- New token category (shadow, gradient stop, etc.)
- Constrain values and editor fields beyond built-ins
- New `$$type` key for REST/MCP create operations

## Key concepts

| Piece | Role |
|-------|------|
| `Variable_Types_Registry` | type key → prop type instance |
| `elementor/variables/register` | Fired on `init`; receives registry |
| `Style_Schema` / `Size_Style_Schema` | Add variable unions to atomic style keys |
| `Global_Variable_Transformer` | PHP: color/font id → `var(--label)` |
| `variableTransformer` (JS) | Editor: all types including size |

Registry lifecycle: `Module::init_variable_types_registry()` on `init` → `do_action( 'elementor/variables/register', $registry )` → built-ins from `Hooks::register_variable_types()`.

## Public API

| Symbol | Signature | Purpose |
|--------|-----------|---------|
| `Variable_Types_Registry` | `public function register( string $key, Transformable_Prop_Type $prop_type ): void` | Add type |
| `Variable_Types_Registry` | `public function get( $key )` | Lookup single type |
| `Variable_Types_Registry` | `public function all(): array` | All registered types |
| `Color_Variable_Prop_Type` | `public static function get_key(): string` | `'global-color-variable'` |
| `Font_Variable_Prop_Type` | `public static function get_key(): string` | `'global-font-variable'` |
| `Size_Variable_Prop_Type` | `public static function get_key(): string` | `'global-size-variable'` |
| `Prop_Type_Adapter` | `GLOBAL_CUSTOM_SIZE_VARIABLE_KEY` | `'global-custom-size-variable'` alias |
| `Rest_Api` | `is_valid_variable_type()` | Validates against `registry->all()` keys |
| `registerVariableType` (JS) | `registerVariableType({ key, icon, propTypeUtil, ... })` | Editor type + transformer |
| `getVariableType` (JS) | `getVariableType( variableType: string )` | Lookup registered JS type |

Source: `classes/variable-types-registry.php`, `prop-types/*-variable-prop-type.php`, `adapters/prop-type-adapter.php`, `classes/rest-api.php`, `editor-variables/src/variables-registry/variable-type-registry.ts`.

## Extension

### PHP

```php
add_action( 'elementor/variables/register', function (
    \Elementor\Modules\Variables\Classes\Variable_Types_Registry $registry
) {
    $registry->register( 'global-shadow-variable', \My\Shadow_Variable_Prop_Type::make() );
} );
```

Also wire:

1. **Style schema** — extend `elementor/atomic-widgets/styles/schema`
2. **Transformer** — `elementor/atomic-widgets/styles/transformers/register` (if PHP render needed)
3. **Storage** — extend `Adapters\Prop_Type_Adapter` if non-string encoding

### JS

```ts
import { registerVariableType } from '@elementor/editor-variables';

registerVariableType( {
    key: 'global-shadow-variable',
    propTypeUtil: shadowVariablePropTypeUtil,
    variableType: 'shadow',
    defaultValue: '0 2px 4px rgba(0,0,0,0.1)',
} );
```

Call from `registerVariableTypes()` in `register-variable-types.tsx`.

### Built-in types

| Type key | PHP class | Value shape |
|----------|-----------|-------------|
| `global-color-variable` | `Color_Variable_Prop_Type` | CSS color string |
| `global-font-variable` | `Font_Variable_Prop_Type` | Font family name |
| `global-size-variable` | `Size_Variable_Prop_Type` | `16px`, `1.5rem`, etc. (Pro) |
| `global-custom-size-variable` | `Size_Variable_Prop_Type` (alias) | `auto`, `clamp(...)`, `calc(...)` (Pro) |

## Internals

- PHP size gap: `Style_Transformers` registers `Global_Variable_Transformer` for color/font only; size resolves in editor JS
- Size schema gating: `Size_Style_Schema` skips angle/time units; grid-track needs Pro ≥ 4.2

## See also

- [overview.md](./overview.md)
- [usage-in-props.md](./usage-in-props.md)
- [../atomic-widgets/hooks.md](../atomic-widgets/hooks.md)
- [../editor-packages/extending-editor.md](../editor-packages/extending-editor.md)
