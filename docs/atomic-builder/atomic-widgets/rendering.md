# Atomic widget rendering

> Audience: internal
> Module: `modules/atomic-widgets/elements/`, `modules/atomic-widgets/styles/`
> Related: [authoring-widgets.md](authoring-widgets.md), [../fundamentals/transformers.md](../fundamentals/transformers.md), [../architecture/data-flow.md](../architecture/data-flow.md)

## What it is

Server-side path from saved element data to frontend HTML and CSS: Twig templates for markup, `Render_Props_Resolver` for settings, `Atomic_Styles_Manager` for per-post CSS files.

> Two rendering engines, one Twig source. The **frontend** renders server-side via PHP Twig (`Template_Renderer`). The **editor canvas** renders the *same* `.twig` source client-side via the bundled Twing JS engine. See [Editor vs. frontend rendering](#editor-vs-frontend-rendering).

## When to use it

- Debugging incorrect frontend output
- Adding or changing Twig templates
- Tracing how `styles` arrays become enqueued CSS
- Registering frontend scripts (tabs, forms, action links)

## Key concepts

### Twig templates

Widgets using `Has_Template` render via `Template_Renderer`:

1. Register template files (element + shared `elementor/macros`)
2. Build context: `id`, `interaction_id`, `type`, `settings` (resolved), `base_styles`
3. `echo $renderer->render( $main_template, $context )`

Container elements default to PHP `before_render` / `after_render` wrappers.

### Render_Props_Resolver

`Render_Props_Resolver::for_settings()` resolves props to plain PHP values:

- Validates PropValue shape per schema key
- Applies context-specific transformers (`settings`, `styles`, `plain`)
- Chained transforms up to `TRANSFORM_DEPTH_LIMIT` (3)
- `disabled: true` → `null`

Used in `Has_Atomic_Base::get_atomic_settings()`.

### Atomic_Styles_Manager

On `elementor/frontend/after_enqueue_post_styles`:

1. Collects post IDs from `elementor/post/render`
2. Fires `elementor/atomic-widgets/styles/register`
3. Renders CSS per breakpoint via `Styles_Renderer`, caches to disk
4. Enqueues `wp_enqueue_style` + fonts

| Path prefix | Provider | Content |
|-------------|----------|---------|
| `['base']` | `Atomic_Widget_Base_Styles` | All types' `define_base_styles()` |
| `['local', $post_id, $context]` | `Atomic_Widget_Styles` | Per-element `styles` from document JSON |

`$context`: `frontend` or `preview`. Cache invalidation: `elementor/atomic-widgets/styles/clear` with path array.

### Frontend handlers

| Handle | Purpose |
|--------|---------|
| `elementor-v2-frontend-handlers` | Base handlers package |
| `elementor-v2-alpinejs` | Alpine.js |
| `elementor-v2-action-link-handlers` | Action links |
| `elementor-v2-form-handlers` | Atomic forms |

Extension: `elementor/atomic-widgets/frontend/loader/scripts/register`.

## Public API

| Symbol | Signature | Purpose |
|--------|-----------|---------|
| `Render_Props_Resolver` | `public static function for_settings(): self` | Settings resolver singleton |
| `Render_Props_Resolver` | `public static function for_styles(): self` | Styles resolver singleton |
| `Render_Props_Resolver` | `public function resolve( array $schema, array $props ): array` | Resolve all schema keys |
| `Render_Props_Resolver` | `public function resolve_value( $value, Prop_Type $prop_type )` | Resolve a single PropValue |
| `Style_Schema` | `public static function get(): array` | All canonical style prop types |
| `Atomic_Styles_Manager` | `public static function instance(): self` | Singleton |
| `Atomic_Styles_Manager` | `public function register( array $path, callable $get_style_defs ): void` | Register CSS provider |
| `Has_Atomic_Base` | `public function get_atomic_settings(): array` | Entry point for Twig `settings` context |

Source: `props-resolver/render-props-resolver.php`, `styles/style-schema.php`, `styles/atomic-styles-manager.php`, `elements/base/has-atomic-base.php`.

## Extension

Extend via [hooks.md](hooks.md) (`styles/register`, transformer registration) and `Has_Template` on new widgets.

## Internals

### Settings → HTML

```
get_atomic_settings()
  → merge initial attributes
  → Render_Props_Resolver::for_settings()->resolve()
  → transform_link_for_render()
  → Twig context['settings']
```

### Render-time content restrictions (independent of sanitization)

There are **two independent** content filters for HTML-bearing props, and changing one does not affect the other:

1. **Save-time sanitization** — `Html_Prop_Type::sanitize()` (and `Html_V2` / `Html_V3`) run `wp_kses()` against `get_base_allowed_tags()` when data is saved. Filterable/overridable by subclassing the prop type.
2. **Render-time tag allow-list** — text-bearing widgets apply their **own** `striptags(...)` call directly in the `.twig` template, on every render. This is the biggest gotcha when changing HTML behavior.

The render-time allow-list is **hardcoded in the template source, per widget**, and is **not filterable from PHP**. Examples:

```twig
{# atomic-heading.html.twig #}
{%- set allowed_tags = '<b><strong><sup><sub><s><em><i><u><a><del><span><br>' -%}
{{ settings.title | striptags(allowed_tags) | raw }}
```

```twig
{# atomic-paragraph.html.twig — list inlined directly in the filter call #}
{{ settings.paragraph | striptags('<b><strong>...<br>') | raw }}
```

`atomic-button.html.twig` uses the same `striptags(allowed_tags)` pattern. To change which tags survive rendering you must edit the Twig template itself — a PHP prop-type override only affects save-time sanitization. (Note: `e('html_tag')` on the wrapper tag is a *separate* mechanism, backed by `Utils::get_allowed_html_wrapper_tags()` and the `elementor/utils/allowed_html_wrapper_tags` filter.)

### Editor vs. frontend rendering

The editor canvas does **not** use PHP at render time. It renders atomic widgets client-side with the bundled Twing JS engine (`@elementor/twing`, wrapped by `editor-canvas/src/renderers/create-dom-renderer.ts`) against the same `.twig` source, delivered as `twig_main_template` + `twig_templates` in `Has_Template::get_initial_config()`.

Consequence: any content-behavior fix applied through PHP (a prop-type override, `elementor/widget/render_content`, or other server-side hooks) affects the **frontend only**. The editor preview keeps rendering the JS-side template and will silently ignore the PHP fix. To change editor-preview behavior you must change the shared `.twig` source (and, for escaping strategies, the JS renderer registers its own — e.g. `html_tag` maps to `escapeHtmlTag`, sourced from `window.elementorCommon.config.allowedHTMLWrapperTags`).

### Styles → CSS

```
element_data['styles']
  → Atomic_Widget_Styles::parse_post_styles()
  → group_by_breakpoint()
  → Styles_Renderer::render()
  → CSS_Files_Manager cache
  → wp_enqueue_style()
```

Style transformers: `elementor/atomic-widgets/styles/transformers/register`.

## See also

- [authoring-widgets.md](authoring-widgets.md) — templates and base styles
- [hooks.md](hooks.md) — `styles/register`, transformer hooks
- [../fundamentals/style-schema.md](../fundamentals/style-schema.md)
- [../css-converter/overview.md](../css-converter/overview.md)
