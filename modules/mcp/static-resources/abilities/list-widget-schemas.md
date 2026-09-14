Returns widget information for every widget type this tool can configure. Types absent from this list must be edited manually in the Elementor editor.

Default mode: Returns a map of `widget_type` to JSON Schema. Prefer `elementor/get-widget-schema` when only one widget type is needed.

With `summary=true`: Returns `{ widgets: [{ type, description }, ...] }` for widget discovery. Use this mode first to discover which widget types exist before fetching full schemas or building compositions.

Values in the returned schemas are plain JSON. Send settings in `build-composition.element_config` and `manage-elements.settings` using this shape directly. Only keys listed under `properties` are accepted; put all visual styling in the `style` (CSS) input.
