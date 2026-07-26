# Data Flow

> Audience: internal
> Module: `modules/atomic-widgets/`, `modules/mcp/`
> Status: draft
> Related: [overview.md](overview.md), [../fundamentals/transformers.md](../fundamentals/transformers.md), [../atomic-widgets/rendering.md](../atomic-widgets/rendering.md)

## What it is

The end-to-end path for atomic element data: from in-editor edits through document persistence, prop resolution, CSS generation, and frontend output — including REST and MCP mutation paths that bypass the visual editor.

## When to use it

- Debugging "saved but not rendered" issues.
- Implementing a new REST endpoint or MCP ability that mutates element data.
- Understanding where validation runs (JS vs PHP).
- Tracing CSS converter output into saved styles.

## Key concepts

### Edit → save (editor path)

```
User edits in Editor V2 (editor-canvas, editor-editing-panel)
  │
  ├─► JS validates PropValues against schema (editor-props)
  │
  ▼
Legacy editor document model (v1 adapters sync state)
  │
  ▼
Document save — `elementor/document/save/data`, `before_save`, `after_save` hooks
  │
  ├─► interactions: `handle_interactions()` on `elementor/document/save/data` (sanitize, validate, assign IDs)
  ├─► components: `validate_circular_dependencies()` on `before_save`; `set_component_overridable_props()` on `after_save`
  │
  ▼
Post meta JSON — elements tree with settings + styles PropValues
```

Save is initiated through the legacy editor's document commands (v1), which v2 packages trigger via adapters. The saved structure matches the element JSON schema exposed by MCP `get-widget-schema`.

### Prop resolution (settings vs styles)

Two parallel resolver pipelines:

| Context | Registry hook | Resolver class | Output |
|---------|--------------|----------------|--------|
| Settings | `elementor/atomic-widgets/settings/transformers/register` | `Render_Props_Resolver` (settings) | HTML attributes, link URLs, class lists |
| Styles | `elementor/atomic-widgets/styles/transformers/register` | `Render_Props_Resolver` (styles) | CSS declaration map |

Flow per prop:

1. Read PropValue `{ $$type, value }`.
2. Look up prop type in schema (settings or `Style_Schema`).
3. Select transformer by `$$type` from `Transformers_Registry`.
4. Transformer returns resolved value (possibly recursive for nested types).

Plain (non-transformable) values use `Plain_Transformer` fallback. Import/export contexts have separate transformer registries.

See [../fundamentals/transformers.md](../fundamentals/transformers.md).

### CSS generation (frontend)

```
Frontend page load for post ID
  │
  ▼
elementor/post/render — Atomic_Styles_Manager collects post IDs
  │
  ▼
elementor/atomic-widgets/styles/register action
  │  (widgets/elements register style defs via path keys)
  ▼
Styles_Renderer — PropValues → CSS rules per breakpoint variant
  │
  ▼
CSS_Files_Manager — writes/updates post-specific CSS file
  │
  ▼
elementor/frontend/after_enqueue_post_styles — enqueues CSS file
```

Kit-level additions:

- **Global classes** — `Atomic_Global_Styles` injects class CSS via relations.
- **Variables** — `Variables_CSS_Renderer` adds `var(--label)` rules on kit CSS parse (`elementor/css-file/post/parse`).

### Twig render (HTML)

Atomic elements use Twig templates (see `modules/atomic-widgets/elements/`). On render:

1. `Render_Props_Resolver` resolves settings props to plain values.
2. Template receives resolved context.
3. `Atomic_Widget_Styles` / `Atomic_Widget_Base_Styles` register style definitions for CSS pipeline.

Preview uses `elementor/ajax/register_actions` → `Render_Element_Action` for server-side element HTML refresh.

### REST mutation paths

| Endpoint area | Module | Purpose |
|---------------|--------|---------|
| CSS converter | `Css_Converter_REST_API` | Convert raw CSS → `{ props, customCss, rejected }` |
| Global classes | `Global_Classes_REST_API` | CRUD kit classes |
| Variables | `Rest_Api` (`modules/variables/classes/rest-api.php`) | CRUD kit variables |
| Components | `Components_REST_API` | Component document operations |
| Opt-in | `POST elementor/v1/operations/opt-in-v4` | Enable v4 experiment bundle |

REST handlers validate input, mutate kit meta or document data, and return JSON. They do not enqueue editor packages.

### MCP mutation paths

PHP abilities in `modules/mcp/abilities/` operate on documents and kit data server-side:

| Ability | Mutation |
|---------|----------|
| `build-composition` | Insert element tree from XML + configs |
| `manage-elements` | update/delete/move/duplicate (uses CSS converter) |
| `manage-classes` | Global class CRUD |
| `manage-global-variable` | Variable CRUD |

MCP hosts connect via `McpAdapter` / `Mcp_Proxy_REST_API` — no v4 experiment required. Abilities read/write the same post meta JSON the editor saves.

In-editor MCP tools (`editor-mcp` JS registry) mutate the open document through editor APIs — a separate path documented in [../mcp/registering-editor-tools.md](../mcp/registering-editor-tools.md).

### CSS converter in the pipeline

When MCP or the style applier receives raw CSS for an element:

```
Css_Converter::convert( $css, $schema )
  → parse → expand_shorthands → converter loop
  → variable_transformer → validate_props → cleanup_props
  → { props: PropValues, customCss: string, rejected: string[] }
```

Converted `props` merge into element styles; `customCss` stored separately; `rejected` returned to caller. See [../css-converter/pipeline.md](../css-converter/pipeline.md).

## Extension

### Adding a save-time hook

```php
add_action( 'elementor/document/before_save', function ( Document $document, array $data ) {
    // Validate or transform $data['elements'] before persistence
}, 10, 2 );
```

### Adding a style registration

```php
add_action( 'elementor/atomic-widgets/styles/register', function ( $manager, array $post_ids ) {
    $manager->register( [ 'my-extension' ], fn() => $style_definitions );
}, 10, 2 );
```

### Adding a settings transformer

```php
add_action( 'elementor/atomic-widgets/settings/transformers/register', function ( $registry ) {
    $registry->register( My_Prop_Type::get_key(), new My_Transformer() );
} );
```

Prefer registration hooks over modifying resolver internals.

## Internals

### Validation layers

| Layer | Location | When |
|-------|----------|------|
| JS `validatePropValue` | `editor-props` | Live editing |
| PHP `Props_Parser` | `modules/atomic-widgets/parsers/` | Save/import |
| PHP interactions `Validation` | `modules/interactions/` | Document save |
| CSS converter `validate_props` | `css-converter/` | CSS → props |

Partial-null bypass and disabled prop semantics: [../fundamentals/validation.md](../fundamentals/validation.md).

### Plain values resolver

`Module::get_settings_plain_values_resolver()` builds a `Plain_Values_Resolver` for non-rendering contexts (export, MCP plain-value needs). Registers via `elementor/atomic-widgets/settings-resolvers/register`.

### Cache invalidation

`Atomic_Styles_Manager` listens to `elementor/atomic-widgets/styles/clear` to invalidate cached CSS by path. `Cache_Validity` tracks style definition changes.

### Import/export

`Atomic_Import_Export` and kit snapshot filters handle prop migrations on import. `Migrations_Orchestrator` runs when `e_bc_migrations` is active.

## See also

- [overview.md](overview.md)
- [packages-map.md](packages-map.md)
- [../atomic-widgets/rendering.md](../atomic-widgets/rendering.md)
- [../css-converter/pipeline.md](../css-converter/pipeline.md)
- [../mcp/composition-workflow.md](../mcp/composition-workflow.md)
- [../migration/prop-type-migrations.md](../migration/prop-type-migrations.md)
