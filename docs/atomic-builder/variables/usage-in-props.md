# Variables in PropValues

> Audience: both
> Module: `modules/variables/prop-types/`, `modules/atomic-widgets/props-resolver/`
> Related: [../fundamentals/prop-value.md](../fundamentals/prop-value.md), [types.md](./types.md), [usage-in-styles.md](./usage-in-styles.md)

## What it is

When a style control supports variables, the saved value is a **PropValue** with a global-variable `$$type` and the variable's **internal id** in `value`. Render resolves to `var(--label)`.

```json
{
  "$$type": "global-color-variable",
  "value": "e-gv-abc123"
}
```

Editor shows label (`wc26-gold`); CSS uses `var(--wc26-gold)`.

## When to use it

- Bind atomic style props to kit tokens via variables popover
- Serialize styles that update when a token value changes
- Let CSS converter promote `var(--label)` literals during MCP composition

Prefer PropValue binding over raw `var(--label)` in `custom_css` when the style key has a variable union.

## Key concepts

### Variable prop type keys

| `$$type` | Binds to | Stored `value` | Rendered as |
|----------|----------|----------------|-------------|
| `global-color-variable` | Color style keys | Variable id | `var(--label)` |
| `global-font-variable` | `font-family` | Variable id | `var(--label)` |
| `global-size-variable` | Size keys (Pro) | Variable id | Editor: `var(--label, fallback)`; PHP: not wired |
| `global-custom-size-variable` | Complex sizes (Pro) | Variable id | Editor JS only |

### Style schema unions

`Style_Schema` adds `global-color-variable` to `Color_Prop_Type` keys and `global-font-variable` to `font-family`. `Size_Style_Schema` adds size unions (skips angle/time; grid-track needs Pro ≥ 4.2).

Filter: `elementor/atomic-widgets/styles/schema`.

### Resolution pipeline

1. Style variant stores PropValue with id in `value`
2. **PHP:** `Style_Transformers` registers `Global_Variable_Transformer` for color/font only → `var(--{label})`
3. **JS:** `registerVariableType()` auto-registers `variableTransformer` for all types including size

### Editor binding UX

`editor-variables` replaces controls when a variable PropValue is assigned. Popover creates or assigns tokens. `extractVariablesFromStyleValue()` discovers bindings.

## Public API

| Symbol | Signature | Purpose |
|--------|-----------|---------|
| `Color_Variable_Prop_Type` | `public static function get_key(): string` | `'global-color-variable'` |
| `Font_Variable_Prop_Type` | `public static function get_key(): string` | `'global-font-variable'` |
| `Size_Variable_Prop_Type` | `public static function get_key(): string` | `'global-size-variable'` |
| `Global_Variable_Transformer` | `public function transform( $value, Props_Resolver_Context $context )` | id → `var(--label)` or grid `repeat()` |
| `Variables` | `public static function by_id( string $id )` | Lookup during transform |
| `Style_Schema` (variables) | augments `elementor/atomic-widgets/styles/schema` | Adds variable unions |
| `variableTransformer` (JS) | `transform( value, context )` | Editor canvas resolution |
| `useVariableBoundProp` (JS) | hook for bound prop state | Control replacement |

Source: `prop-types/*-variable-prop-type.php`, `transformers/global-variable-transformer.php`, `classes/variables.php`, `classes/style-schema.php`, `editor-variables/src/transformers/variable-transformer.ts`, `hooks/use-variable-bound-prop.ts`.

## Extension

1. Register type on `elementor/variables/register` ([types.md](./types.md))
2. Augment `elementor/atomic-widgets/styles/schema`
3. Register transformer on `elementor/atomic-widgets/styles/transformers/register` (if PHP render needed)
4. Add `registerVariableType()` in `editor-variables`

## Internals

| Component | Path |
|-----------|------|
| Transformer | `transformers/global-variable-transformer.php` |
| Runtime lookup | `classes/variables.php` |
| Storage encoding | `adapters/prop-type-adapter.php` |
| Variable control | `controls/variable-control.tsx` |

PropValue `value` holds id (stable across label renames). MCP update requires both `id` and current `label`.

## See also

- [types.md](./types.md)
- [usage-in-styles.md](./usage-in-styles.md)
- [../fundamentals/style-schema.md](../fundamentals/style-schema.md)
- [../global-classes/applying-classes.md](../global-classes/applying-classes.md)
