# Interactions schema

> Audience: both
> Module: `modules/interactions/schema/interactions-schema.php`
> Related: [overview.md](./overview.md) · [../fundamentals/prop-value.md](../fundamentals/prop-value.md) · [../fundamentals/validation.md](../fundamentals/validation.md)

## What it is

`Interactions_Schema` defines the canonical PHP prop-type tree for interaction data. Consumed by validation, import/export, prop-type migrations, and the editor MCP schema resource.

```php
Interactions_Schema::get();
// → apply_filters( 'elementor/atomic-widgets/interactions/schema', … )
```

Built-in schema: `version` + `items` array typed by `Interaction_Item_Prop_Type`.

## When to use it

- **Extending capabilities** — add fields or item prop types via the filter.
- **Validating JSON** — `Validation` enforces trigger/effect/type/direction against `Presets`.
- **LLM / MCP authoring** — PHP schema is server-side source of truth; editor exposes `elementor://interactions/schema`.

## Key concepts

### Interaction item (`interaction-item`)

| Field | Prop type | Description |
|-------|-----------|-------------|
| `interaction_id` | `string` | Stable per-item id; assigned on save as `{post_id}-{element_id}-*` |
| `trigger` | `string` (enum) | When the animation fires |
| `animation` | `animation-preset-props` | Effect, type, direction, timing, config |
| `breakpoints` | `interaction-breakpoints` | Breakpoint exclusions |

### Animation preset (`animation-preset-props`)

| Field | Prop type | Description |
|-------|-----------|-------------|
| `effect` | `string` (enum) | `fade`, `slide`, `scale`, `custom` |
| `type` | `string` (enum) | `in` or `out` |
| `direction` | `string` (enum) | Slide direction (see snapshot) |
| `timing_config` | `timing-config` | `duration`, `delay` (`Time_Size_Prop_Type`, ms) |
| `config` | `config-v2` | `replay`, `easing`, `relativeTo`, `repeat`, `times`, `start`, `end` |
| `custom_effect` | `custom-effect` | `keyframes` — Pro only (`meta: pro`) |

### Breakpoints (`interaction-breakpoints`)

| Field | Prop type | Description |
|-------|-----------|-------------|
| `excluded` | `excluded-breakpoints` | Breakpoint labels where interaction is skipped |

### Built-in values (snapshot)

Source: `modules/interactions/presets.php`. **pro** meta = Pro-only.

**Triggers**

| Key | Tier |
|-----|------|
| `load`, `scrollIn` | Base |
| `scrollOut`, `scrollOn`, `hover`, `click` | Pro |

**Effects:** `fade`, `slide`, `scale` (base); `custom` (Pro).

**Types:** `in`, `out`.

**Directions:** `left`, `right`, `top`, `bottom`, `top-left`, `top-right`, `bottom-left`, `bottom-right`, `""`.

**Easing:** `easeIn` (base); `easeOut`, `easeInOut`, `backIn`, `backInOut`, `backOut`, `linear` (Pro).

**Defaults:** duration `600` ms, delay `0`, slide distance `100`, scale start `0`, easing `easeIn`, scroll range `85%`–`15%`, `relativeTo` `viewport`.

**Limit:** max 5 items per element (`Validation`).

## Extension

### Filter: `elementor/atomic-widgets/interactions/schema`

```php
add_filter( 'elementor/atomic-widgets/interactions/schema', function ( array $schema ) {
    $item = $schema['items'][0];
    $shape = $item->get_shape();
    $shape['my_extension'] = My_Extension_Prop_Type::make();
    $item->set_shape( $shape );
    return $schema;
} );
```

Also update PHP `Validation`, editor `registerInteractionsControl`, and frontend `isSupportedInteraction()` in `interactions-utils.js`.

Prop types live under `modules/interactions/props/`. Follow existing `Object_Prop_Type` subclasses.

## Public API

| Symbol | Signature | Purpose | Source |
|--------|-----------|---------|--------|
| `Interactions_Schema` | `::get(): array`, `::get_interactions_schema(): array` | Schema entry points | `schema/interactions-schema.php` |
| `Interaction_Item_Prop_Type` | `::get_key()` → `'interaction-item'` | Root item shape | `props/interaction-item-prop-type.php` |
| `Animation_Preset_Prop_Type` | `::get_key()` → `'animation-preset-props'` | Effect + timing shape | `props/animation-preset-prop-type.php` |
| `Animation_Config_Prop_Type` | `::get_key()` → `'config-v2'` | Replay, easing, scroll range | `props/animation-config-prop-type.php` |
| `Timing_Config_Prop_Type` | `::get_key()` → `'timing-config'` | Duration + delay | `props/timing-config-prop-type.php` |
| `Custom_Effect_Prop_Type` | `::get_key()` → `'custom-effect'` | Keyframe custom effects | `props/custom-effect-prop-type.php` |
| `Interaction_Breakpoints_Prop_Type` | `::get_key()` → `'interaction-breakpoints'` | Breakpoint wrapper | `props/interaction-breakpoints-prop-type.php` |
| `Presets` | `triggers_options()`, `effects_options()`, `easing_options()`, `defaults()` | Enum constants and defaults | `presets.php` |

## Internals

- **Consumers** — `atomic-import-export`, `Schema_Resolver` migrations, editor MCP `interactions-schema-resource.ts`.
- **Save IDs** — `Parser` assigns `{post_id}-{element_id}-*` via `Utils::generate_id()`.
- **Pro gating** — prop-type `meta( 'pro', … )` documents Pro-only values; editor limits base-tier options via `PromotionSelect`.

## See also

- [overview.md](./overview.md) — experiment gate and module map
- [editor.md](./editor.md) — controls registry
- [frontend.md](./frontend.md) — runtime subset vs full schema
- [../fundamentals/prop-types.md](../fundamentals/prop-types.md) — prop-type authoring
- [../migration/prop-type-migrations.md](../migration/prop-type-migrations.md) — schema migrations
