# Variable types

> Audience: both
> Module: `modules/variables/classes/variable-types-registry.php`, `modules/variables/hooks.php`
> Status: final
> Related: [usage-in-props.md](./usage-in-props.md), [../fundamentals/prop-types.md](../fundamentals/prop-types.md), [../fundamentals/transformers.md](../fundamentals/transformers.md)

## What it is

A **variable type** is a `Transformable_Prop_Type` registered in `Variable_Types_Registry`. The type key (e.g. `global-color-variable`) determines validation, storage encoding, style-schema unions, and which transformer resolves PropValues at render time.

Types are **not** a fixed catalog — new types are added through the `elementor/variables/register` action, the same hook core uses for built-ins.

## When to use it

- Add a new category of design token (e.g. shadow, gradient stop) that should appear in the variables panel and bind to style props.
- Constrain values and editor fields for a token family beyond what built-in types offer.
- Expose a new `$$type` key for MCP/REST create operations.

## Key concepts

| Piece | Role |
|-------|------|
| `Variable_Types_Registry` | In-memory map: type key → prop type instance |
| `elementor/variables/register` | Action fired once on `init`; receives the registry |
| `Transformable_Prop_Type` | Atomic-widgets prop type contract; provides `get_key()`, `generate()`, validation |
| Style schema augmentation | `Style_Schema` / `Size_Style_Schema` add variable unions to matching atomic style keys |
| `Global_Variable_Transformer` | PHP: registered for color/font keys only (`classes/style-transformers.php`). JS: `variableTransformer` handles all types via `registerVariableType()` |

Registry lifecycle (`module.php`):

1. `Module::init_variable_types_registry()` runs on `init`.
2. Instantiates `Variable_Types_Registry`.
3. Fires `do_action( 'elementor/variables/register', $registry )`.
4. Built-in types are registered from `Hooks::register_variable_types()` on that same action.

## Extension

### PHP — register a new variable type

```php
add_action( 'elementor/variables/register', function (
    \Elementor\Modules\Variables\Classes\Variable_Types_Registry $registry
) {
    $registry->register(
        'global-shadow-variable', // your $$type / REST type key
        \My\Shadow_Variable_Prop_Type::make() // extends Transformable_Prop_Type
    );
} );
```

After registration, also wire:

1. **Style schema** — extend `elementor/atomic-widgets/styles/schema` (or augment inside your module) so target style keys accept a union with your prop type. Follow `classes/style-schema.php` for color/font patterns.
2. **Style transformer** — register on `elementor/atomic-widgets/styles/transformers/register` if values need id → `var(--label)` resolution at PHP render time. Color and font use `Global_Variable_Transformer` in `classes/style-transformers.php`; size types currently rely on the editor `variableTransformer` only (see [usage-in-props.md](./usage-in-props.md#resolution-pipeline)).
3. **REST validation** — `Rest_Api::is_valid_variable_type()` reads `array_keys( $registry->all() )`; no extra REST wiring needed once registered.
4. **Storage adapter** — if values need non-string encoding, extend `Adapters\Prop_Type_Adapter` schema map.

### Editor side (JS)

Register a matching UI entry in `editor-variables`:

```ts
import { registerVariableType } from '@elementor/editor-variables';

registerVariableType( {
    key: 'global-shadow-variable',
    icon: MyIcon,
    propTypeUtil: shadowVariablePropTypeUtil,
    fallbackPropTypeUtil: stringPropTypeUtil,
    variableType: 'shadow',
    defaultValue: '0 2px 4px rgba(0,0,0,0.1)',
} );
```

Call from `registerVariableTypes()` in `packages/packages/core/editor-variables/src/register-variable-types.tsx`. The registry (`variables-registry/variable-type-registry.ts`) auto-registers style and inheritance transformers when a `propTypeUtil` is supplied.

### Snapshot — built-in types today

> Labeled snapshot only; may grow via `elementor/variables/register`.

| Type key | PHP class | Value shape | Notes |
|----------|-----------|-------------|-------|
| `global-color-variable` | `Color_Variable_Prop_Type` | CSS color string | Union on `Color_Prop_Type` style keys |
| `global-font-variable` | `Font_Variable_Prop_Type` | Font family name only | Union on `font-family` |
| `global-size-variable` | `Size_Variable_Prop_Type` | `16px`, `1.5rem`, etc. | Pro; union on `Size_Prop_Type` keys |
| `global-custom-size-variable` | `Size_Variable_Prop_Type` (alias) | `auto`, `clamp(...)`, `calc(...)` | Pro; stored as size with `unit: custom` |

`Hooks::register_variable_types()` registers color, font, size, and custom-size (via `Prop_Type_Adapter::GLOBAL_CUSTOM_SIZE_VARIABLE_KEY`). Size types require Elementor Pro in the editor (`register-variable-types.tsx` promotions) and in MCP guide output.

## Internals

- **Registry API** — `register( string $key, Transformable_Prop_Type $prop_type )`, `get()`, `all()` (`variable-types-registry.php`).
- **Built-in registration** — `hooks.php` → `register_variable_types()` hooks `elementor/variables/register`.
- **PHP size gap** — `Style_Transformers` does not register `Global_Variable_Transformer` for size keys; editor canvas uses JS `variableTransformer` instead.
- **Prop type classes** — `modules/variables/prop-types/*.php`; each extends `String_Prop_Type` with a static `get_key()`.
- **Size schema gating** — `Size_Style_Schema` skips angle/time units; grid-track size variables need Pro ≥ 4.2 (`PRO_VERSION_FOR_GRID_TRACK_VARIABLES`).
- **Quota** — color/font promotion limits set in `Module::get_quota_config()` (100,000 each in current code).

## See also

- [overview.md](./overview.md) — experiments and kit storage
- [usage-in-props.md](./usage-in-props.md) — binding PropValues
- [../atomic-widgets/hooks.md](../atomic-widgets/hooks.md) — `elementor/atomic-widgets/styles/schema` filter
- [../editor-packages/extending-editor.md](../editor-packages/extending-editor.md) — package registration
