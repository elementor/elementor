Returns the JSON Schema for a single widget type's settings, including default values and nesting guidance. Use elementor/list-widget-schemas with summary=true first to discover valid widget_type values.

Values in the returned schema are plain JSON. Send settings in `build-composition.element_config` and `manage-elements.settings` using this shape directly (scalars as scalars, dynamic tags as `{ name, settings }`).
