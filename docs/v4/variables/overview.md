# Variables overview

> Audience: both
> Module: `modules/variables/` · `packages/packages/core/editor-variables/`
> Related: [types.md](./types.md), [usage-in-props.md](./usage-in-props.md), [../getting-started/experiments.md](../getting-started/experiments.md)

## What it is

Kit-scoped design tokens for v4 atomic editing. Each variable has a **label** (public CSS name), internal **id** (`e-gv-*`), **type** (color, font, size), and plain CSS **value**.

Kit CSS on `:root`:

```css
:root { --wc26-gold:#C6A15B; --font-heading:"Playfair Display"; }
```

Reference by **label**: `var(--wc26-gold)`, not `var(--e-gv-...)`.

Distinct from legacy v3 Site Settings globals. Color variables may optionally sync to v3 (`sync_to_v3`).

## When to use it

- Reusable palette, typography, or spacing scale for the active kit
- Bind style props to tokens instead of literals
- Reference tokens in raw CSS (`custom_css`)
- Agent discovery/mutation via REST or MCP

## Key concepts

| Concept | Detail |
|---------|--------|
| Kit scope | Post meta `_elementor_global_variables` |
| Label vs id | Label = CSS custom-property name; id = internal storage and PropValue `value` |
| Watermark | Optimistic-concurrency integer; required for batch writes |
| Limit | 1,000 variables per kit |
| Experiments | `e_variables` (PHP module); `e_variables_manager` (editor UI only) |
| JS package | `editor-variables` via `elementor/editor/v2/packages` |

### Experiments

| Experiment | Depends on | Default |
|------------|------------|---------|
| `e_variables` | `e_atomic_elements` | active (alpha, hidden) |
| `e_variables_manager` | `e_variables` | active (alpha, hidden) |

## Public API

| Symbol | Signature | Purpose |
|--------|-----------|---------|
| `Variable_Types_Registry` | `public function register( string $key, Transformable_Prop_Type $prop_type ): void` | Register variable type |
| `Variable_Types_Registry` | `public function get( $key )` / `all(): array` | Lookup registered types |
| `Variables_Repository` | `public function load(): Variables_Collection` | Read kit variables |
| `Variables_Repository` | `public function save( Variables_Collection $collection )` | Persist + increment watermark |
| `Variables` | `public static function by_id( string $id )` | Runtime lookup during style render |
| `Variables_Service` | `public function find_by_label_or_id( string $needle ): ?array` | Resolve label or id |
| `Global_Variable_Transformer` | `public function transform( $value, Props_Resolver_Context $context )` | id → `var(--label)` |
| `Color_Variable_Prop_Type` | `public static function get_key(): string` | `'global-color-variable'` |
| `Font_Variable_Prop_Type` | `public static function get_key(): string` | `'global-font-variable'` |
| `Size_Variable_Prop_Type` | `public static function get_key(): string` | `'global-size-variable'` |
| `registerVariableType` (JS) | `registerVariableType({ key, propTypeUtil, ... })` | Editor UI + transformer wiring |
| `service` (JS) | `variables(): TVariablesList` | In-memory variable list |

Source: `classes/variable-types-registry.php`, `storage/variables-repository.php`, `classes/variables.php`, `services/variables-service.php`, `transformers/global-variable-transformer.php`, `prop-types/*-variable-prop-type.php`, `editor-variables/src/index.ts`.

## Extension

Register types on `elementor/variables/register` — see [types.md](./types.md). Also requires `registerVariableType()` in `editor-variables` for editor UI.

## Internals

| Piece | Path |
|-------|------|
| Bootstrap | `module.php` |
| Hooks | `hooks.php` — REST, CSS, style-schema, type registration |
| Storage | `storage/` — `Variables_Repository`, `Variable` entity |
| CSS | `classes/css-renderer.php` — `:root` block on kit CSS parse |
| Style unions | `classes/style-schema.php`, `classes/size-style-schema.php` |
| Import/export | `import-export-customization/` — `global-variables.json` |

## See also

- [types.md](./types.md)
- [usage-in-props.md](./usage-in-props.md)
- [usage-in-styles.md](./usage-in-styles.md)
- [api.md](./api.md)
