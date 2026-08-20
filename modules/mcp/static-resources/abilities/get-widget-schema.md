Returns the JSON Schema for a single widget type's settings, including default values and nesting guidance.

Use `elementor/list-widget-schemas` with `summary=true` first to discover valid `widget_type` values. Types not returned by that endpoint are not supported by this tool and must be edited directly in the Elementor editor (call fails with `elementor_v3_not_supported`).

Values in the returned schema are plain JSON. Send settings in `build-composition.element_config` and `manage-elements.settings` using this shape directly (scalars as scalars, dynamic tags as `{ name, settings }`). Only keys listed under `properties` are accepted; put all visual styling in the `style` (CSS) input.
