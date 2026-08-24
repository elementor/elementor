Returns the JSON Schema for a single widget type's settings, including default values and nesting guidance.

Use `elementor/list-widget-schemas` with `summary=true` first to discover valid `widget_type` values. Types not returned by that endpoint are not supported by this tool and must be edited directly in the Elementor editor (call fails with `elementor_v3_not_supported`).

Values in the returned schema are plain JSON. Send settings in `build-composition.element_config` and `manage-elements.settings` using this shape directly (scalars as scalars, dynamic tags as `{ name, settings }`). Only keys listed under `properties` are accepted; put visual styling in the `style` (CSS) input.

**V3 widgets with `inner_elements`:** When the schema includes an `inner_elements` object (e.g. `nav-menu`), each key is a canonical alias for a sub-part of the widget. Put scoped rules in `style` using alias blocks — `main-menu { color: #111; }`, `dropdown:hover { color: #222; }`, etc. Unscoped declarations map to the widget's default inner element. Read each alias's `description`, `accepted_css_properties`, and `supported_states` before styling. `classes` still attach to the widget wrapper only.
