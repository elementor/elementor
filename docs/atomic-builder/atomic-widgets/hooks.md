# Atomic widgets hooks

> Audience: external
> Module: `modules/atomic-widgets/`
> Related: [authoring-widgets.md](authoring-widgets.md), [../fundamentals/prop-types.md](../fundamentals/prop-types.md), [../fundamentals/transformers.md](../fundamentals/transformers.md)

## What it is

Verified `elementor/atomic-widgets/*` filters and actions. Hook strings are exact.

Related (different namespace): `elementor/atomic/dynamic_tags/*` → [../dynamic-tags/extending.md](../dynamic-tags/extending.md).

## When to use it

- Extending props or style schemas
- Registering transformers or plain-value resolvers
- Adding style providers or frontend scripts
- Post-processing MCP LLM JSON schemas

## Key concepts

### Transformer contexts

```
elementor/atomic-widgets/{context}/transformers/register
```

Verified `{context}`: `settings`, `styles`, `import`, `export`.

Callback args: `( Transformers_Registry $registry, Props_Resolver $resolver )`.

## Extension

### Filters

| Hook | Args | Purpose |
|------|------|---------|
| `elementor/atomic-widgets/props-schema` | `$schema` | Add/modify prop types (no element context) |
| `elementor/atomic-widgets/styles/schema` | `$schema` | Extend canonical style keys |
| `elementor/atomic-widgets/controls` | `$controls`, `$element` | Modify editor control tree |
| `elementor/atomic-widgets/llm-json-schema` | `$schema` | Post-process single prop JSON Schema for MCP |
| `elementor/atomic-widgets/settings/transformers/classes` | `$value`, `$context` | Filter resolved class list at render |
| `elementor/atomic-widgets/styles/transitions/allowed-properties` | `$properties` | Allowed CSS properties for transition transformer |

### Actions — transformers

| Hook | Args | Purpose |
|------|------|---------|
| `elementor/atomic-widgets/{context}/transformers/register` | `$registry`, `$resolver` | Register transformers per context |
| `elementor/atomic-widgets/settings-resolvers/register` | `Plain_Resolvers_Registry $registry` | Plain-value resolvers for non-transformable props |

### Actions — styles & frontend

| Hook | Args | Purpose |
|------|------|---------|
| `elementor/atomic-widgets/styles/register` | `Atomic_Styles_Manager $manager`, `int[] $post_ids` | Register style providers |
| `elementor/atomic-widgets/styles/clear` | `string[] $path` | Invalidate cached CSS |
| `elementor/atomic-widgets/frontend/loader/scripts/register` | `Frontend_Assets_Loader $loader` | Register frontend scripts |

## Public API

| Symbol | Signature | Purpose |
|--------|-----------|---------|
| `Props_Resolver` | `public function get_transformers_registry(): Transformers_Registry` | Access registry inside transformer hooks |
| `Props_Resolver` | `public static function reset(): void` | Clear resolver singletons (tests) |
| `Render_Props_Resolver` | `public static function for_settings(): self` | Settings context instance |
| `Render_Props_Resolver` | `public static function for_styles(): self` | Styles context instance |
| `Style_Schema` | `public static function get(): array` | Style schema (wraps filter) |
| `Atomic_Styles_Manager` | `public function register( array $path, callable $get_style_defs ): void` | Called from `styles/register` hook |

Source: `props-resolver/props-resolver.php`, `props-resolver/render-props-resolver.php`, `styles/style-schema.php`, `styles/atomic-styles-manager.php`.

## Internals

| Hook | Core listener |
|------|---------------|
| `props-schema` | `Dynamic_Tags_Module` |
| `styles/schema` | `Dynamic_Tags_Module` |
| `styles/register` | `Atomic_Widget_Base_Styles` (10), `Atomic_Widget_Styles` (30) |

Near-miss: `elementor/atomic_widgets/editor_data/element_styles` (underscore, not hyphen) — strips `custom_css` on free/older Pro.

## See also

- [authoring-widgets.md](authoring-widgets.md) — registration API
- [../fundamentals/transformers.md](../fundamentals/transformers.md)
- [../fundamentals/prop-types.md](../fundamentals/prop-types.md)
- [../dynamic-tags/extending.md](../dynamic-tags/extending.md)
