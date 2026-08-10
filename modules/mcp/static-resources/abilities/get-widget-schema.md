Returns the JSON Schema for a single V4 (atomic) widget type's settings, including default values and nesting guidance.

A closed V3 allowlist is also fetchable: `nav-menu`, `theme-post-content`, `theme-post-title`, `theme-post-featured-image`, `theme-post-excerpt`, `theme-archive-title`. Those return the V3 fallback shape (`widget_version: 'v3'`, `message`, `fields_note`, `properties` from legacy control metadata — non-authoritative). Other V3 (legacy) widget types are rejected with `elementor_v3_not_supported` and must be edited directly in the Elementor editor.

Use elementor/list-widget-schemas with summary=true first to discover valid widget_type values.

Values in the returned V4 schema are plain JSON. Send settings in `build-composition.element_config` and `manage-elements.settings` using this shape directly (scalars as scalars, dynamic tags as `{ name, settings }`). For allowlisted V3 widgets, send raw control keys as plain settings (no schema validation).
