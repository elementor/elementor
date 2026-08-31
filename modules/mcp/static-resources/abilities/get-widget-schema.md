Returns the JSON Schema for a single widget type's settings, including default values and nesting guidance.

Use `elementor/list-widget-schemas` with `summary=true` first to discover valid `widget_type` values — the catalog varies with the V4 (atomic) elements experiment. Types not returned by that endpoint are not supported by this tool and must be edited directly in the Elementor editor (call fails with `elementor_v3_not_supported`).

## V4 widgets
Values are plain JSON. Send settings in `build-composition.element_config` and `manage-elements.settings` using this shape directly (scalars as scalars, dynamic tags as `{ name, settings }`). Put visual styling in the `style` (CSS) input.

## V3 widgets (`widget_version: "v3"`)
- **`properties`** — content/behavior only (menu, layout, placeholder, etc.). Visual styling goes in `style`, not here.
- **`message`** — reminds you to use `style` for look-and-feel.
- **`style` round-trip** — after building, `elementor/get-page-structure` with `include_content=true` returns the same alias-block `style` string for allowlisted V3 nodes. Re-send it unchanged to preserve styling.

### Flat V3 (no `inner_elements`)
Examples: `theme-post-title`, `theme-post-content`, `theme-archive-title`.
Use a single flat CSS string per configuration-id: `color: #111; font-size: 2rem; &:hover { color: #aaa; } @media(--mobile) { font-size: 1.5rem; }`.

### Scoped V3 (`inner_elements` present)
Examples: `nav-menu`, `search`, `table-of-contents`.

Each alias under `inner_elements.elements` is a sub-part of the widget. Style it with alias blocks in `style`:

```css
search-field { border-radius: 2rem; background-color: #ffffff; }
submit { background-color: #1a3d2b; }
```

Per alias, read:
- **`accepted_css_properties`** — only these CSS properties are converted to native controls; anything else is dropped with a `warnings` entry.
- **`supported_states`** — use `alias:hover`, `alias:focus`, `alias:active` (e.g. `main-menu:hover { color: #aaa; }`), not `&:hover` inside an alias block.
- **`inner_elements.default`** — unscoped look-and-feel declarations map here when you omit an alias.

Responsive: `@media(--mobile) { search-field { font-size: 0.875rem; } }`.

`classes` still attach to the widget wrapper only.
