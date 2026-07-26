Returns widget information for all V4 (atomic) widgets available to the LLM.

Default mode: Returns a map of widget_type to JSON Schema. Prefer elementor/get-widget-schema when only one widget type is needed.

With summary=true: Returns { widgets: [{ type, description }, ...] } for widget discovery. Use this mode first to discover which widget types exist before fetching full schemas or building compositions.

Values in the returned schemas are plain JSON. Send settings in `build-composition.element_config` and `manage-elements.settings` using this shape directly.
