# Interactions schema

> Audience: both
> Module: `modules/interactions/schema/interactions-schema.php`
> Status: final
> Related: [overview.md](./overview.md) · [../fundamentals/prop-value.md](../fundamentals/prop-value.md) · [../fundamentals/validation.md](../fundamentals/validation.md)

## What it is

`Interactions_Schema` defines the canonical PHP prop-type tree for interaction data. It is consumed by validation, import/export, prop-type migrations (`Schema_Resolver`), and the editor MCP schema resource.

Entry point:

```php
Interactions_Schema::get();
// → apply_filters( 'elementor/atomic-widgets/interactions/schema', … )
```

The built-in schema is minimal — version plus an `items` array typed by `Interaction_Item_Prop_Type`:

```php
[
    'version' => 1,
    'items' => [ Interaction_Item_Prop_Type::make()->description( 'Interaction item' ) ],
]
```

## When to use it

- **Extending interaction capabilities** — add fields to the item shape or register alternate item prop types via the filter (primary use).
- **Validating authored JSON** — `Validation` enforces allowed trigger/effect/type/direction values against `Presets` constants.
- **LLM / MCP authoring** — the editor exposes `elementor://interactions/schema` (see [../mcp/registering-editor-tools.md](../mcp/registering-editor-tools.md)); the PHP schema is the server-side source of truth.

## Key concepts

### Interaction item (`interaction-item`)

| Field | Prop type | Description |
|-------|-----------|-------------|
| `interaction_id` | `string` | Stable per-item id (editor preview, MCP); assigned on save as `{post_id}-{element_id}-*` |
| `trigger` | `string` (enum) | When the animation fires |
| `animation` | `animation-preset-props` | Effect, type, direction, timing, config |
| `breakpoints` | `interaction-breakpoints` | Breakpoint exclusions |

### Animation preset (`animation-preset-props`)

| Field | Prop type | Description |
|-------|-----------|-------------|
| `effect` | `string` (enum) | `fade`, `slide`, `scale`, `custom` |
| `type` | `string` (enum) | `in` or `out` |
| `direction` | `string` (enum) | Slide direction (see snapshot below) |
| `timing_config` | `timing-config` | `duration`, `delay` (`Time_Size_Prop_Type`, ms) |
| `config` | `config-v2` | `replay`, `easing`, `relativeTo`, `repeat`, `times`, `start`, `end` |
| `custom_effect` | `custom-effect` | `keyframes` — Pro only (`meta: pro`) |

### Breakpoints (`interaction-breakpoints`)

| Field | Prop type | Description |
|-------|-----------|-------------|
| `excluded` | `excluded-breakpoints` | Array of breakpoint labels where the interaction is skipped |

### Built-in values (snapshot — may change)

Source: `modules/interactions/presets.php`. Fields marked **pro** in prop-type `meta` require Elementor Pro.

**Triggers**

| Label | Key | Tier |
|-------|-----|------|
| Page load | `load` | Base |
| Scroll into view | `scrollIn` | Base |
| Scroll out of view | `scrollOut` | Pro |
| While scrolling | `scrollOn` | Pro |
| On hover | `hover` | Pro |
| On click | `click` | Pro |

**Effects:** `fade`, `slide`, `scale` (base); `custom` (Pro).

**Types:** `in`, `out`.

**Directions:** `left`, `right`, `top`, `bottom`, `top-left`, `top-right`, `bottom-left`, `bottom-right`, `""` (none).

**Easing:** `easeIn` (base); `easeOut`, `easeInOut`, `backIn`, `backInOut`, `backOut`, `linear` (Pro).

**Repeat:** `""` (none), `loop`, `times`.

**Defaults:** duration `600` ms, delay `0`, slide distance `100`, scale start `0`, easing `easeIn`, scroll range start `85%` / end `15%`, `relativeTo` `viewport`.

**Limits:** max 5 interaction items per element (`Validation::$max_number_of_interactions`).

## Extension

### Filter: `elementor/atomic-widgets/interactions/schema`

This is the primary extension point. Hook it to merge new prop types into the schema returned by `Interactions_Schema::get()`:

```php
add_filter( 'elementor/atomic-widgets/interactions/schema', function ( array $schema ) {
    /** @var \Elementor\Modules\Interactions\Props\Interaction_Item_Prop_Type $item */
    $item = $schema['items'][0];
    $shape = $item->get_shape();
    $shape['my_extension'] = My_Extension_Prop_Type::make();
    $item->set_shape( $shape );
    return $schema;
} );
```

Also update:

1. **PHP validation** — `Validation` has hardcoded allowed values for triggers/effects; extend or filter there for server-side enforcement.
2. **Editor controls** — `registerInteractionsControl()` in `@elementor/editor-interactions` (see [editor.md](./editor.md)).
3. **Frontend runtime** — `interactions-utils.js` `isSupportedInteraction()` currently allows only `load`, `scrollIn`, `scrollOut` and excludes `custom`. New triggers/effects need JS support.

Prop types live under `modules/interactions/props/`. Follow existing `Object_Prop_Type` subclasses (`Interaction_Item_Prop_Type`, `Animation_Preset_Prop_Type`, etc.).

## Internals

- **Filter application** — single call site: `Interactions_Schema::get()` in `schema/interactions-schema.php`.
- **Consumers** — `atomic-import-export.php` (shape for prop resolution), `schema-resolver.php` (migrations), editor MCP `interactions-schema-resource.ts`.
- **Save IDs** — `Parser` assigns `{post_id}-{element_id}-*` ids via `Utils::generate_id()`, replacing `temp-*` editor ids.
- **Pro gating** — prop-type `meta( 'pro', … )` documents Pro-only enum values (triggers, effects, `custom_effect`). Editor UI limits base-tier options via `registerInteractionsControl` + `PromotionSelect`; MCP merges `proSchema` only when `isProActive()`. PHP `Validation` accepts all schema values regardless of Pro — server-side Pro stripping via `Prop_Shape_Filter_For_Pro` is referenced in prop types but not implemented yet.

## See also

- [overview.md](./overview.md) — experiment gates and module map
- [editor.md](./editor.md) — controls registry mirroring schema fields
- [frontend.md](./frontend.md) — which schema values the runtime actually executes
- [../fundamentals/prop-types.md](../fundamentals/prop-types.md) — prop-type authoring
- [../migration/prop-type-migrations.md](../migration/prop-type-migrations.md) — schema version migrations
