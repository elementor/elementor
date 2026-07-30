Returns the JSON Schema for a single V4 (atomic) widget type's settings, including default values and nesting guidance. V3 (legacy) widget types are rejected with elementor_v3_not_supported and must be edited directly in the Elementor editor. Use elementor/list-widget-schemas with summary=true first to discover valid widget_type values.

Values in the returned schema are plain JSON. Send settings in `build-composition.element_config` and `manage-elements.settings` using this shape directly (scalars as scalars, dynamic tags as `{ name, settings }`).
