Returns widget information for every widget type this tool can configure. Types absent from this list must be edited manually in the Elementor editor.

Default mode (`content: all`): Returns a map of `widget_type` to JSON Schema for **V4 widgets only**. Legacy V3 widget schemas are omitted from bulk responses — call `elementor/get-widget-schema` per V3 type (e.g. `nav-menu`, `slides`) or read `elementor://widgets/schema/v3-advanced-basics` for shared Advanced-tab keys.

With `summary=true`: Returns `{ widgets: [{ type, description, version? }, ...] }` for discovery, including allowlisted V3 types. Use this mode first to discover widget types before fetching individual schemas.

Values in the returned schemas are plain JSON. Send settings in `build-composition.element_config` and `manage-elements.settings` using this shape directly. Only keys listed under `properties` are accepted; put all visual styling in the `style` (CSS) input.
