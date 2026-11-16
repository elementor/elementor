# Extending dynamic tags

> Audience: external
> Module: `modules/dynamic-tags/` + `modules/atomic-widgets/dynamic-tags/dynamic-prop-types-mapping.php`
> Related: [overview.md](./overview.md), [binding-propvalues.md](./binding-propvalues.md), [discovery.md](./discovery.md)

## What it is

Adding a dynamic data source requires:

1. **Register a legacy (v3) tag** — same API since Elementor 2.x.
2. **Ensure atomic mapping** — bridge picks up the tag when categories match; custom prop types need explicit `Dynamic_Prop_Type`.

Central mapping: `Dynamic_Prop_Types_Mapping` (hooks `elementor/atomic-widgets/props-schema` and `elementor/atomic-widgets/styles/schema`).

## When to use it

- Plugin provides new WordPress data source.
- Tag needed in atomic widgets, MCP composition, and editor picker.
- Custom atomic prop type should accept dynamic bindings.

## Key concepts

### Step 1 — Register a legacy tag

```php
add_action( 'elementor/dynamic_tags/register', function ( $dynamic_tags_manager ) {
    $dynamic_tags_manager->register( new \MyPlugin\Tags\Store_Hours() );
} );
```

```php
class Store_Hours extends \Elementor\Core\DynamicTags\Tag {
    public function get_name() { return 'store-hours'; }
    public function get_title() { return 'Store Hours'; }
    public function get_group() { return 'my-plugin'; }
    public function get_categories() {
        return [ \Elementor\Modules\DynamicTags\Module::TEXT_CATEGORY ];
    }
    protected function register_controls() { /* … */ }
    public function render() { /* … */ }
}
```

Register new groups: `Plugin::$instance->dynamic_tags->register_group( 'my-plugin', [ 'title' => 'My Plugin' ] )`.

### Step 2 — Atomic mapping (automatic)

`Dynamic_Tags_Editor_Config` converts the tag. `Dynamic_Prop_Types_Mapping` adds `Dynamic_Prop_Type` to matching prop schemas when tag categories intersect.

**Convertible controls:** `text`, `textarea`, `select`, `number`, `switcher`, `choose`, `query`, `date_time`, `media`.

**`force_convert_to_atomic`** — override `get_editor_config()`:

```php
public function get_editor_config() {
    return array_merge( parent::get_editor_config(), [
        'force_convert_to_atomic' => true,
    ] );
}
```

Skips unsupported controls instead of blocking conversion.

### Step 3 — Custom prop types (manual)

```php
$shape['to'] = Union_Prop_Type::make()
    ->add_prop_type( String_Array_Prop_Type::make()->required() )
    ->add_prop_type( Dynamic_Prop_Type::make()->categories( [
        \Elementor\Modules\DynamicTags\Module::TEXT_CATEGORY,
    ] ) )
    ->required();
```

Opt out: `String_Prop_Type::make()->meta( Dynamic_Prop_Type::ignore() )`.

### Select control filters

For dynamic select options:

- `elementor/atomic/dynamic-tags/select_control_options` — flat options
- `elementor/atomic/dynamic-tags/select_control_groups` — grouped options

## Extension

Checklist:

1. `Tag` subclass with `get_name()`, `get_categories()`, convertible controls.
2. Hook `elementor/dynamic_tags/register`.
3. Confirm via `list-dynamic-tags` ([discovery.md](./discovery.md)).
4. Custom prop type? Add `Dynamic_Prop_Type` to its union.

No public filter for category mapping — add `Dynamic_Prop_Type` directly in your prop type union, or extend `Dynamic_Prop_Types_Mapping` in core.

## Public API

| Symbol | Signature | Purpose | Source |
|--------|-----------|---------|--------|
| `Plugin::$instance->dynamic_tags` | `register( Base_Tag )`, `register_group()` | Legacy tag registry | `core/dynamic-tags/manager.php` |
| `Module` (v3) | `TEXT_CATEGORY`, `URL_CATEGORY`, `IMAGE_CATEGORY`, … | Category constants | `modules/dynamic-tags/module.php` |
| `Dynamic_Tags_Module` | `::instance()`, `register_hooks()` | Bridge init | `dynamic-tags-module.php` |
| `Dynamic_Prop_Types_Mapping` | `::make()`, `get_extended_schema( $schema )` | Auto-inject dynamic union | `dynamic-prop-types-mapping.php` |
| `Dynamic_Prop_Type` | `::make()->categories( [ … ] )` | Manual union member | `dynamic-prop-type.php` |
| `Dynamic_Tags_Converter` | `convert_control_to_prop_type( $control )` | Control → prop type | `dynamic-tags-converter.php` |
| `ImportExport\Dynamic_Transformer` | import/export transformer | Fills `group` on I/E | `import-export/dynamic-transformer.php` |

**Hooks:**

| Hook | Purpose |
|------|---------|
| `elementor/dynamic_tags/register` | Register legacy tags |
| `elementor/atomic/dynamic-tags/select_control_options` | Filter select options |
| `elementor/atomic/dynamic-tags/select_control_groups` | Filter grouped options |

## Internals

- **Registry refresh** — `Dynamic_Tags_Module::fresh()` rebuilds singleton (tests).
- **Render** — `Dynamic_Transformer` on `elementor/atomic-widgets/settings/transformers/register`.
- **LLM** — `Dynamic_Tag_Llm_Resolver` injects `group`, wraps plain settings.

## See also

- [overview.md](./overview.md) — bridge architecture
- [binding-propvalues.md](./binding-propvalues.md) — PropValue shape
- [discovery.md](./discovery.md) — verify tag is listed
- [../atomic-widgets/authoring-widgets.md](../atomic-widgets/authoring-widgets.md) — define prop schemas
- [developers.elementor.com](https://developers.elementor.com/docs/dynamic-tags/) — legacy v3 tutorial
