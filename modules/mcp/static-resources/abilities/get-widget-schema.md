Returns the JSON Schema for a single widget type's settings, including default values and nesting guidance.

Use `elementor/list-widget-schemas` with `summary=true` first to discover promoted widget types for new work. Types omitted from that list may still be valid here when you pass `widget_type` explicitly (for example `e-flexbox` on an existing page from `elementor/get-page-structure`). Unknown types fail with `elementor_not_found`; legacy V3 widgets fail with `elementor_v3_not_supported`.

Values in the returned schema are plain JSON. Send settings in `build-composition.element_config` and `manage-elements.settings` using this shape directly (scalars as scalars, dynamic tags as `{ name, settings }`). Only keys listed under `properties` are accepted; put all visual styling in the `style` (CSS) input.
