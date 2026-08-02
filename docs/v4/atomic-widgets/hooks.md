# Atomic widgets hooks

> Audience: external
> Module: `modules/atomic-widgets/`
> Status: final
> Related: [authoring-widgets.md](authoring-widgets.md), [../fundamentals/prop-types.md](../fundamentals/prop-types.md), [../fundamentals/transformers.md](../fundamentals/transformers.md)

## What it is

Verified `elementor/atomic-widgets/*` filters and actions from `modules/atomic-widgets/`. Hook strings are exact — do not abbreviate.

Related hooks outside this prefix (different namespace): `elementor/atomic/dynamic_tags/*` → [../dynamic-tags/extending.md](../dynamic-tags/extending.md); `elementor/atomic/form/email_action_count` on `e-form`.

## When to use it

- Extending props or style schemas
- Registering transformers or plain-value resolvers
- Adding style providers or frontend scripts
- Post-processing MCP LLM JSON schemas

## Key concepts

### Transformer contexts

`Props_Resolver` fires dynamic registration actions per context:

```
elementor/atomic-widgets/{context}/transformers/register
```

Verified `{context}` values: `settings`, `styles`, `import`, `export`.

**Callback args:** `( Transformers_Registry $registry, Props_Resolver $resolver )` for every context (`Props_Resolver::instance()` always passes both). Import/export listeners often ignore the second arg; `settings`/`styles` listeners (e.g. dynamic tags) use it to register nested resolvers.

## Extension

### Filters

| Hook | Fired from | Args | Purpose |
|------|------------|------|---------|
| `elementor/atomic-widgets/props-schema` | `Has_Atomic_Base::get_props_schema()` | `$schema` (array of `Prop_Type`) | Add or modify prop types; no element/class context — runs on every static `get_props_schema()` call |
| `elementor/atomic-widgets/styles/schema` | `Style_Schema::get()` | `$schema` | Extend canonical style keys |
| `elementor/atomic-widgets/controls` | `Has_Atomic_Base::get_atomic_controls()` | `$controls`, `$element` | Modify editor control tree |
| `elementor/atomic-widgets/llm-json-schema` | `Widget_Context_Helper::to_plain_llm_schema_from_json()` (MCP) | `$schema` (single prop's JSON Schema array) | Post-process each prop schema before MCP export — not the full widget schema |
| `elementor/atomic-widgets/settings/transformers/classes` | `Classes_Transformer` | `$value`, `$context` | Filter resolved class list at render |
| `elementor/atomic-widgets/styles/transitions/allowed-properties` | `Transition_Transformer` | `$properties` | Allowed CSS properties for transition transformer |

**Example — extend props schema:**

```php
add_filter( 'elementor/atomic-widgets/props-schema', function ( array $schema ) {
    $schema['badge'] = String_Prop_Type::make();
    return $schema;
} );
```

**Example — extend style schema:**

```php
add_filter( 'elementor/atomic-widgets/styles/schema', function ( array $schema ) {
    $schema['my-custom-prop'] = Size_Prop_Type::make();
    return $schema;
} );
```

**Example — LLM schema dedupe / enrichment:**

```php
add_filter( 'elementor/atomic-widgets/llm-json-schema', function ( array $schema ) {
    // Adjust schema before MCP returns it
    return $schema;
} );
```

### Actions — transformers and resolvers

| Hook | Fired from | Args | Purpose |
|------|------------|------|---------|
| `elementor/atomic-widgets/settings/transformers/register` | `Props_Resolver` instance init | `$registry`, `$resolver` | Register settings-context transformers |
| `elementor/atomic-widgets/styles/transformers/register` | same | `$registry`, `$resolver` | Register styles-context transformers |
| `elementor/atomic-widgets/import/transformers/register` | same | `$registry`, `$resolver` | Import transformers |
| `elementor/atomic-widgets/export/transformers/register` | same | `$registry`, `$resolver` | Export transformers |
| `elementor/atomic-widgets/settings-resolvers/register` | `Module::get_settings_plain_values_resolver()` | `Plain_Resolvers_Registry $registry` | Register plain-value resolvers for non-transformable props |

Core registers default transformers in `module.php` (`register_settings_transformers`, `register_styles_transformers`, etc.).

### Actions — styles

| Hook | Fired from | Args | Purpose |
|------|------------|------|---------|
| `elementor/atomic-widgets/styles/register` | `Atomic_Styles_Manager::enqueue_styles()` | `Atomic_Styles_Manager $manager`, `int[] $post_ids` | Register style providers via `$manager->register( $path, $callable )` |
| `elementor/atomic-widgets/styles/clear` | cache invalidation | `string[] $path` | Invalidate cached CSS for path (e.g. `['local', 123]`, `['base']`) |

### Actions — frontend

| Hook | Fired from | Args | Purpose |
|------|------------|------|---------|
| `elementor/atomic-widgets/frontend/loader/scripts/register` | `Frontend_Assets_Loader::register_scripts()` | `Frontend_Assets_Loader $loader` | Register additional frontend scripts |

## Internals

### Built-in listeners (reference)

| Hook | Listener |
|------|----------|
| `elementor/atomic-widgets/props-schema` | `Dynamic_Tags_Module` — extends schema with dynamic prop unions |
| `elementor/atomic-widgets/styles/schema` | `Dynamic_Tags_Module` — dynamic style bindings |
| `elementor/atomic-widgets/llm-json-schema` | `Dynamic_Tags_Module` (`LLM_Schema_Dedupe_Filter`), `components/module.php` |
| `elementor/atomic-widgets/styles/register` | `Atomic_Widget_Base_Styles` (priority 10), `Atomic_Widget_Styles` (priority 30) |

### Near-miss hook (underscore prefix)

`elementor/atomic_widgets/editor_data/element_styles` — filter in `Atomic_Widget_Styles::get_license_based_filtered_styles()` (note **underscore** in `atomic_widgets`, not hyphen). Strips `custom_css` from styles on free / older Pro. Not part of the `elementor/atomic-widgets/*` namespace.

## See also

- [authoring-widgets.md](authoring-widgets.md) — registration API
- [../fundamentals/transformers.md](../fundamentals/transformers.md) — transformer patterns
- [../fundamentals/prop-types.md](../fundamentals/prop-types.md) — `props-schema` usage
- [../dynamic-tags/extending.md](../dynamic-tags/extending.md) — dynamic tag bridge hooks
