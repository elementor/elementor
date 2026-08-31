Returns widget information for every widget type this tool can configure. Types absent from this list must be edited manually in the Elementor editor.

The exact catalog depends on whether the site has V4 (atomic) elements enabled — always call this tool to discover the available widget types rather than assuming a fixed list.

Default mode: Returns a map of `widget_type` to JSON Schema. Prefer `elementor/get-widget-schema` when only one widget type is needed.

With `summary=true`: Returns `{ widgets: [{ type, description }, ...] }` for widget discovery. Use this mode first to discover which widget types exist before fetching full schemas or building compositions.

Values in the returned schemas are plain JSON. Send settings in `build-composition.element_config` and `manage-elements.settings` using this shape directly. Only keys listed under `properties` are accepted; put visual styling in the `style` (CSS) input.

V3 schemas (`widget_version: "v3"`) may include `inner_elements` for widgets with multiple styleable sub-parts (`nav-menu`, `search`, `table-of-contents`). Use alias blocks in `style` (see `elementor/get-widget-schema`). Flat V3 widgets (`theme-post-title`, etc.) use a single CSS string with `&:hover` and `@media(--breakpoint)` like V4.
