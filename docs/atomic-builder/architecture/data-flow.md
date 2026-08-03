# Data Flow

> Audience: internal
> Module: `modules/atomic-widgets/`, `modules/mcp/`
> Related: [overview.md](overview.md), [../fundamentals/transformers.md](../fundamentals/transformers.md), [../atomic-widgets/rendering.md](../atomic-widgets/rendering.md)

## What it is

End-to-end path for atomic element data: editor edits → document persistence → prop resolution → CSS generation → frontend output. Includes REST and MCP mutation paths that bypass the visual editor.

## When to use it

- Debugging "saved but not rendered" issues
- Implementing REST/MCP endpoints that mutate element data
- Understanding where validation runs (JS vs PHP)
- Tracing CSS converter output into saved styles

## Key concepts

### Edit → save (editor path)

```
Editor V2 (canvas, editing-panel)
  ├─► JS validatePropValue (editor-props)
  ▼
Legacy document model (v1 adapters sync)
  ▼
Document save — elementor/document/save/data, before_save, after_save
  ├─► interactions: handle_interactions() on save/data
  ├─► components: validate_circular_dependencies() on before_save
  ▼
Post meta JSON — elements[].settings + elements[].styles
```

### Prop resolution

| Context | Hook | Resolver | Output |
|---------|------|----------|--------|
| Settings | `…/settings/transformers/register` | `Render_Props_Resolver` | HTML attrs, links, classes |
| Styles | `…/styles/transformers/register` | `Render_Props_Resolver` | CSS declarations |

Per prop: read `{ $$type, value }` → look up type in schema → select transformer by `$$type` → resolve (recursive for nested types). `Plain_Transformer` is the fallback.

Import/export use separate registries. See [../fundamentals/transformers.md](../fundamentals/transformers.md).

### CSS generation (frontend)

```
Frontend page load
  ▼
elementor/post/render — Atomic_Styles_Manager collects post IDs
  ▼
elementor/atomic-widgets/styles/register
  ▼
Styles_Renderer — PropValues → CSS per breakpoint variant
  ▼
CSS_Files_Manager — per-post .css file
  ▼
elementor/frontend/after_enqueue_post_styles
```

Kit additions: global classes via `Atomic_Global_Styles`; variables via `Variables_CSS_Renderer` on `elementor/css-file/post/parse`.

### Twig render (HTML)

1. `Render_Props_Resolver` resolves settings props
2. Twig template receives resolved context
3. `Atomic_Widget_Styles` registers style defs for CSS pipeline

Preview: `Render_Element_Action` via `elementor/ajax/register_actions`.

### REST mutation paths

| Area | Module | Purpose |
|------|--------|---------|
| CSS converter | `Css_Converter_REST_API` | Raw CSS → `{ props, customCss, rejected }` |
| Global classes | `Global_Classes_REST_API` | CRUD kit classes |
| Variables | `Rest_Api` | CRUD kit variables |
| Components | `Components_REST_API` | Component document ops |
| Opt-in | `POST elementor/v1/operations/opt-in-v4` | Enable v4 bundle |

### MCP mutation paths

PHP abilities (`modules/mcp/abilities/`): `build-composition`, `manage-elements`, `manage-classes`, `manage-global-variable`. No experiment gate; read/write same post meta as the editor.

In-editor MCP tools mutate the open document via editor APIs — [../mcp/registering-editor-tools.md](../mcp/registering-editor-tools.md).

### CSS converter pipeline

```
Css_Converter::convert( $css )
  → parse → expand_shorthands → converter loop
  → variable_transformer → validate_props → cleanup_props
  → { props, customCss, rejected }
```

### Public API

| Symbol | Signature | Purpose |
|--------|-----------|---------|
| `Props_Parser::make()` | `static make( array $schema ): self` | Build parser from schema map |
| `Props_Parser::parse()` | `parse( array $props ): Parse_Result` | Validate + sanitize |
| `Render_Props_Resolver::resolve()` | `resolve( array $schema, array $props ): array` | Resolve props to render output |
| `Css_Converter::convert()` | `convert( string $css ): array` | CSS → atomic style props |
| `Module::get_settings_plain_values_resolver()` | `get_settings_plain_values_resolver(): Plain_Values_Resolver` | Non-render plain-value resolution |

## Extension

### Save-time hook

```php
add_action( 'elementor/document/before_save', function ( Document $document, array $data ) {
    // Validate or transform $data['elements']
}, 10, 2 );
```

### Style registration

```php
add_action( 'elementor/atomic-widgets/styles/register', function ( $manager, array $post_ids ) {
    $manager->register( [ 'my-extension' ], fn() => $style_definitions );
}, 10, 2 );
```

### Settings transformer

```php
add_action( 'elementor/atomic-widgets/settings/transformers/register', function ( $registry ) {
    $registry->register( My_Prop_Type::get_key(), new My_Transformer() );
} );
```

## Internals

### Validation layers

| Layer | Location | When |
|-------|----------|------|
| JS `validatePropValue` | `editor-props` | Live editing |
| PHP `Props_Parser` | `parsers/props-parser.php` | Save/import |
| PHP interactions `Validation` | `modules/interactions/` | Document save |
| CSS converter `validate_props` | `css-converter/` | CSS → props |

Partial-null bypass: [../fundamentals/validation.md](../fundamentals/validation.md).

### Cache invalidation

`Atomic_Styles_Manager` listens to `elementor/atomic-widgets/styles/clear`. `Cache_Validity` tracks definition changes.

### Import/export

`Atomic_Import_Export` handles kit snapshots. `Migrations_Orchestrator` runs lazy prop migrations on document load.

## See also

- [overview.md](overview.md)
- [packages-map.md](packages-map.md)
- [../atomic-widgets/rendering.md](../atomic-widgets/rendering.md)
- [../css-converter/pipeline.md](../css-converter/pipeline.md)
- [../mcp/composition-workflow.md](../mcp/composition-workflow.md)
