# Extending dynamic tags

> Audience: external
> Module: `modules/dynamic-tags/` + `modules/atomic-widgets/dynamic-tags/dynamic-prop-types-mapping.php`
> Status: final
> Related: [overview.md](./overview.md), [binding-propvalues.md](./binding-propvalues.md), [discovery.md](./discovery.md)

## What it is

Adding a new dynamic data source requires two steps:

1. **Register a legacy (v3) tag** — the same API used since Elementor 2.x.
2. **Ensure atomic mapping** — the v4 bridge picks up the tag automatically when its categories match a prop type; for custom prop types, wire `Dynamic_Prop_Type` explicitly.

The central mapping class is `Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Prop_Types_Mapping`. It extends `Prop_Types_Schema_Extender` and is invoked by `Dynamic_Tags_Module` on the `elementor/atomic-widgets/props-schema` and `elementor/atomic-widgets/styles/schema` filters.

## When to use it

- Your plugin provides a new WordPress data source (custom post field, WooCommerce value, API-backed text).
- You need the tag available in atomic widgets, MCP composition, and the editor dynamic-tag picker.
- You are adding a custom atomic prop type that should accept dynamic bindings.

## Key concepts

### Step 1 — Register a legacy tag

Hook `elementor/dynamic_tags/register` and call `register()` on the manager:

```php
add_action( 'elementor/dynamic_tags/register', function ( $dynamic_tags_manager ) {
    $dynamic_tags_manager->register( new \MyPlugin\Tags\Store_Hours() );
} );
```

Your tag class extends `Elementor\Core\DynamicTags\Tag` (output) or `Data_Tag` (structured data). Implement:

```php
class Store_Hours extends \Elementor\Core\DynamicTags\Tag {

    public function get_name() {
        return 'store-hours';
    }

    public function get_title() {
        return 'Store Hours';
    }

    public function get_group() {
        return 'my-plugin'; // legacy editor grouping
    }

    public function get_categories() {
        return [ \Elementor\Modules\DynamicTags\Module::TEXT_CATEGORY ];
    }

    protected function register_controls() {
        $this->add_control( 'format', [
            'label'   => 'Format',
            'type'    => \Elementor\Controls_Manager::SELECT,
            'default' => 'short',
            'options' => [
                'short' => 'Short',
                'long'  => 'Long',
            ],
        ] );
    }

    public function render() {
        echo esc_html( my_plugin_get_hours( $this->get_settings( 'format' ) ) );
    }
}
```

Register the group if it is new:

```php
\Elementor\Plugin::$instance->dynamic_tags->register_group( 'my-plugin', [
    'title' => 'My Plugin',
] );
```

Use category constants from `Elementor\Modules\DynamicTags\Module`. The category determines which atomic prop types accept this tag (see mapping table in [binding-propvalues.md](./binding-propvalues.md)).

### Step 2 — Atomic mapping (automatic)

Once registered, `Dynamic_Tags_Editor_Config` converts the tag for the atomic editor. No extra registration call is needed for standard prop types.

`Dynamic_Prop_Types_Mapping::get_prop_types_to_add()` checks each transformable prop type, resolves related categories via `get_related_categories()`, and adds:

```php
Dynamic_Prop_Type::make()
    ->categories( $categories )
    ->allowed_tag_names( $allowed_tag_names );
```

If your tag's categories intersect a prop type's mapped categories, the prop schema gains a `dynamic` union member and your tag appears in `list-dynamic-tags`.

**Control compatibility** — both `Dynamic_Tags_Editor_Config` (editor picker) and `Dynamic_Tags_Converter` (settings `props_schema`) support: `text`, `textarea`, `select`, `number`, `switcher`, `choose`, `query`, `date_time`, `media`. Tags with unsupported controls are excluded unless `force_convert_to_atomic` is set in the tag's editor config (see below).

**`force_convert_to_atomic`** — not a `Base_Tag` method; add it by overriding `get_editor_config()`:

```php
public function get_editor_config() {
    return array_merge( parent::get_editor_config(), [
        'force_convert_to_atomic' => true,
    ] );
}
```

When set, unsupported controls are skipped instead of blocking atomic conversion. No production tags use this flag today; it exists for edge-case tags with a mix of convertible and legacy-only controls.

### Step 3 — Custom prop types (manual mapping)

When your atomic widget defines a prop type not covered by `Dynamic_Prop_Types_Mapping`, add `Dynamic_Prop_Type` to a union explicitly. Example from `Emails_Prop_Type`:

```php
$shape['to'] = Union_Prop_Type::make()
    ->add_prop_type( String_Array_Prop_Type::make()->required() )
    ->add_prop_type(
        Dynamic_Prop_Type::make()->categories( [
            \Elementor\Modules\DynamicTags\Module::TEXT_CATEGORY,
        ] )
    )
    ->required();
```

To opt a built-in prop **out** of dynamics:

```php
String_Prop_Type::make()->meta( Dynamic_Prop_Type::ignore() );
```

### Extending the category map

`Dynamic_Prop_Types_Mapping::get_related_categories()` is **private** and there is **no public filter** for third-party category mapping. To support a new prop type class:

1. **Preferred** — add `Dynamic_Prop_Type::make()->categories( [ … ] )` directly in your prop type's union (see Step 3 above).
2. **Core change** — add the prop type → category case inside `Dynamic_Prop_Types_Mapping` in Elementor core.

### Select control filters

When legacy select options are dynamic (e.g. depend on post type), use:

- `elementor/atomic/dynamic-tags/select_control_options` — filter flat options
- `elementor/atomic/dynamic-tags/select_control_groups` — filter grouped options

## Extension

Minimum checklist:

1. `Tag` subclass with `get_name()`, `get_categories()`, `get_group()`, and convertible controls.
2. Hook `elementor/dynamic_tags/register`.
3. Confirm via `list-dynamic-tags` ([discovery.md](./discovery.md)).
4. Custom prop type? Add `Dynamic_Prop_Type` to its union (Step 3).

## Internals

- **Registry refresh** — `Dynamic_Tags_Module::fresh()` rebuilds the singleton after tags register (used in tests; normally tags register before atomic widgets boot).
- **Schema build** — `Dynamic_Tags_Schemas::get( $tag_name )` lazily converts legacy controls to prop types.
- **Render path** — `Dynamic_Transformer` in the settings/styles transformer registry (`elementor/atomic-widgets/settings/transformers/register`).
- **LLM normalization** — `Dynamic_Tag_Llm_Resolver` (PHP MCP) and `dynamicTagLLMResolver` (in-editor) inject `group` from the registry and wrap plain settings into PropValues.
- **Import/export** — separate `ImportExport\Dynamic_Transformer` adds `group` from the registry on import/export.

## See also

- [overview.md](./overview.md) — bridge architecture
- [binding-propvalues.md](./binding-propvalues.md) — PropValue JSON shape
- [discovery.md](./discovery.md) — verify your tag is listed
- [../atomic-widgets/authoring-widgets.md](../atomic-widgets/authoring-widgets.md) — define props schemas
- [../atomic-widgets/hooks.md](../atomic-widgets/hooks.md) — `elementor/atomic-widgets/*` filters
- [developers.elementor.com](https://developers.elementor.com/docs/dynamic-tags/) — legacy v3 dynamic tag tutorial
