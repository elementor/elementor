# Atomic widget rendering

> Audience: internal
> Module: `modules/atomic-widgets/elements/`, `modules/atomic-widgets/styles/`
> Status: final
> Related: [authoring-widgets.md](authoring-widgets.md), [../fundamentals/transformers.md](../fundamentals/transformers.md), [../architecture/data-flow.md](../architecture/data-flow.md)

## What it is

The server-side path from saved element data to frontend HTML and CSS: Twig templates for markup, `Render_Props_Resolver` for settings, and `Atomic_Styles_Manager` for per-post CSS files.

## When to use it

- Debugging incorrect frontend output for atomic widgets
- Adding or changing Twig templates
- Tracing how element `styles` arrays become enqueued CSS
- Registering frontend scripts (tabs, forms, action links)

## Key concepts

### Twig templates

Widgets using `Has_Template` render via `Template_Renderer` (`elements/template-renderer/template-renderer.php`):

1. Register template files (element-specific + shared `elementor/macros` from `_macros.html.twig`)
2. Build context: `id`, `interaction_id`, `type`, `settings` (resolved), `base_styles` (class dictionary)
3. `echo $renderer->render( $main_template, $context )`

`get_initial_config()` also ships `twig_main_template` and inline `twig_templates` contents to the editor for preview parity.

Custom escapers: `full_url` → `esc_url`, `html_tag` → `Utils::validate_html_tag`. Auto-escape strategy: `name`.

Container elements (`Atomic_Element_Base`) default to PHP `before_render` / `after_render` wrappers; many use `Has_Element_Template` for inner content.

### Render_Props_Resolver

`Render_Props_Resolver::for_settings()` resolves props schema to plain PHP values for Twig/PHP render:

- Walks each schema key, validates PropValue shape
- Applies context-specific transformers (`settings` or `styles` registry)
- Supports chained transforms up to `TRANSFORM_DEPTH_LIMIT` (3)
- Honors `disabled: true` on PropValues (resolves to `null`)

Used in `Has_Atomic_Base::get_atomic_settings()` before templates read `settings`.

### Atomic_Styles_Manager

Singleton (`styles/atomic-styles-manager.php`) orchestrates CSS output:

1. On `elementor/frontend/after_enqueue_post_styles`, collects post IDs from `elementor/post/render`
2. Fires `elementor/atomic-widgets/styles/register` — registrars attach style providers
3. For each registered path × breakpoint, renders CSS via `Styles_Renderer`, caches to disk through `CSS_Files_Manager`
4. Enqueues `wp_enqueue_style` per generated file; collects and enqueues fonts via `Style_Fonts`

**Registrars (priority order):**

| Path prefix | Provider | Content |
|-------------|----------|---------|
| `['base']` | `Atomic_Widget_Base_Styles` | All atomic types' `define_base_styles()` |
| `['local', $post_id, $context]` | `Atomic_Widget_Styles` | Per-element `styles` from document JSON |

`$context` is `frontend` or `preview`. Files land under `elementor/css/` (`CSS_Files_Manager::DEFAULT_CSS_DIR`).

Cache invalidation: `elementor/atomic-widgets/styles/clear` with path array (e.g. `['local', 123]`). Triggered on document save, file cache clear, post delete.

### Frontend handlers package

`Frontend_Assets_Loader` registers scripts on `elementor/frontend/before_register_scripts`:

| Handle | Asset | Depends on |
|--------|-------|------------|
| `elementor-v2-frontend-handlers` | `assets/js/packages/frontend-handlers/` | — |
| `elementor-v2-alpinejs` | `assets/js/packages/alpinejs/` | — |
| `elementor-v2-action-link-handlers` | `assets/js/atomic-widgets-action-link-handler.js` | frontend-handlers |
| `elementor-v2-form-handlers` | `assets/js/atomic-widgets-form-handler.js` | frontend-handlers, alpinejs |

Elements add handles via `get_script_depends()` (e.g. action links, `e-form`, `e-tabs` tabs-handler). Extension point: `elementor/atomic-widgets/frontend/loader/scripts/register`.

## Extension

N/A for internal pipeline — extend via [hooks.md](hooks.md) (`styles/register`, transformer registration) and `Has_Template` on new widgets.

## Internals

### Settings → HTML flow

```
get_atomic_settings()
  → merge initial attributes
  → Render_Props_Resolver::for_settings()->resolve()
  → transform_link_for_render() (widgets)
  → Twig context['settings']
```

### Styles → CSS flow

```
element_data['styles']
  → Atomic_Widget_Styles::parse_post_styles() (traverse document)
  → group_by_breakpoint()
  → Styles_Renderer::render() per breakpoint
  → CSS_Files_Manager::get() write/cache
  → wp_enqueue_style()
```

`Style_Props_To_Css` converts resolved style props to declaration strings. Transformers for styles context are registered on `elementor/atomic-widgets/styles/transformers/register`.

### Error handling

`Has_Template::render()` swallows exceptions unless `Utils::is_elementor_debug()` — then rethrows.

## See also

- [authoring-widgets.md](authoring-widgets.md) — defining templates and base styles
- [hooks.md](hooks.md) — `styles/register`, transformer hooks
- [../fundamentals/style-schema.md](../fundamentals/style-schema.md)
- [../css-converter/overview.md](../css-converter/overview.md)
