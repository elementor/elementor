# build-composition

> Audience: external  
> Module: `modules/mcp/abilities/build-composition-ability.php`  
> Status: draft  
> Related: [../composition-workflow.md](../composition-workflow.md), [get-widget-schema.md](get-widget-schema.md), [manage-classes.md](manage-classes.md)

## What it is

Ability ID: **`elementor/build-composition`**

Creates v4 element trees on a document from an XML skeleton plus parallel maps for settings (`element_config`), raw CSS (`style`), and global class labels (`classes`). Validates nesting, applies the AtomicWidgets CSS converter, and persists via `Composition_Persister`.

Annotations: `readonly: false`, `destructive: false`, `idempotent: false`.  
Permission: `edit_posts` (plus `edit_post` on target `post_id`).

## When to use it

- Insert new sections or widgets under a parent container
- Redesign a container's children (`mode: replace_children`)
- Validate a composition without saving (`dry_run: true`)

Not for editing existing elements by ID — use [manage-elements.md](manage-elements.md).

## Key concepts

### Required input

| Field | Type | Description |
|-------|------|-------------|
| `post_id` | integer | WordPress post ID of the Elementor document |
| `xml_structure` | string | XML with widget tags and `configuration-id` on every element |

### Optional input

| Field | Default | Description |
|-------|---------|-------------|
| `element_config` | `{}` | `configuration-id` → plain widget settings (see `get-widget-schema`) |
| `style` | `{}` | `configuration-id` → raw CSS declarations (`property` → value) |
| `classes` | `{}` | `configuration-id` → array of global class **labels** |
| `parent_id` | `document` | Parent element ID or `document` for root |
| `mode` | `append` | `append` or `replace_children` |
| `dry_run` | `false` | Validate only; do not persist |

### XML structure

- Tags are widget types: `<e-flexbox>`, `<e-heading>`, `<e-button>`, etc.
- Attribute: `configuration-id="hero-title"` — **unique** per element, human-meaningful
- **Forbidden in XML:** other attributes, classes, element IDs, text nodes
- Nesting must satisfy `allowed_child_types` / `required_direct_children` from widget schemas
- Do not wrap in CDATA — causes `empty_composition` error

Example:

```json
{
  "post_id": 123,
  "xml_structure": "<e-flexbox configuration-id=\"hero-section\"><e-heading configuration-id=\"hero-title\"></e-heading></e-flexbox>",
  "element_config": {
    "hero-title": {
      "tag": "h2",
      "title": { "content": "Welcome", "children": [] }
    }
  },
  "style": {
    "hero-section": { "padding-top": "6rem", "padding-bottom": "6rem" },
    "hero-title": { "font-size": "3.5rem" }
  },
  "classes": {
    "hero-title": ["text-muted"]
  }
}
```

Prefer **longhand** CSS properties; shorthand may fall back to `custom_css` (stripped on Pro 3.35+).

### element_config format

Plain JSON matching `elementor/get-widget-schema` output — no `$$type` wrappers for standard props:

- Strings/enums: `"h2"`, `"https://example.com"`
- html-v3: `{ "content": "Hello", "children": [] }`
- Dynamic (where allowed): `{ "name": "post-title", "settings": { } }` — read `elementor://dynamic-tags`
- Image: `{ "src": { "url": "https://example.com/photo.jpg" }, "size": "full" }`

Omit keys listed in `llm_guidance.default_settings` unless the user requests a change.

### Globals in style and classes

- Variables: `color: var(--brand-primary)` — labels from `elementor://global-variables`
- Classes: labels from `elementor://global-classes`; create via `manage-classes` first

### mode and dry_run

- **`append`**: add children under `parent_id`
- **`replace_children`**: remove direct children of `parent_id`, then insert; response includes `removed_element_ids`
- **`dry_run`**: full validation pipeline, no `Composition_Persister` call

### Output

| Field | Description |
|-------|-------------|
| `success` | `true` on success |
| `post_id` | Document ID |
| `root_element_ids` | IDs of created root-level elements (empty when `dry_run`) |
| `preview_url` | Editor preview URL |
| `version` | Post modified timestamp |
| `resolved_xml` | XML with Elementor element IDs embedded |
| `llm_instructions` | Next-step hint for the agent |
| `warnings` | Non-fatal skips (unknown props, CSS fallbacks) |
| `removed_element_ids` | Present when `mode: replace_children` |

## Extension

N/A — consume via MCP host. Widget schemas extend through atomic widget registration (see [../../atomic-widgets/authoring-widgets.md](../../atomic-widgets/authoring-widgets.md)).

## Internals

Subfolder `modules/mcp/abilities/build-composition/`:

- `Xml_Parser` — `configuration-id` attribute constant, `composition-root` wrapper
- `Widget_Type_Resolver` — tag → widget config, child type validation
- `Subtree_Builder` — DOM → element tree index
- `Element_Config_Applier`, `Class_Applier`, `Style_Applier` — apply parallel maps
- `Composition_Persister` — `Document_Mutator` insert/save

Uses `Css_Converter`, `Converter_Registry_Factory`, `Expander_Registry_Factory`, `Variable_Prop_Value_Transformer` when variables experiment is active.

## See also

- [../composition-workflow.md](../composition-workflow.md) — full workflow
- [get-widget-schema.md](get-widget-schema.md) — per-widget settings schema
- [../../dynamic-tags/binding-propvalues.md](../../dynamic-tags/binding-propvalues.md) — dynamic prop shape
