Returns widget information for V4 (atomic) widgets and a closed V3 allowlist available to the LLM.

V3 allowlist members: `nav-menu`, `theme-post-content`, `theme-post-title`, `theme-post-featured-image`, `theme-post-excerpt`, `theme-archive-title`. Allowlisted V3 entries use the V3 fallback shape (`widget_version: 'v3'`, control metadata hints — not a validated JSON Schema). Other V3 widgets are omitted.

Default mode: Returns a map of widget_type to JSON Schema (or V3 fallback). Prefer elementor/get-widget-schema when only one widget type is needed.

With summary=true: Returns { widgets: [{ type, description }, ...] } for widget discovery. Use this mode first to discover which widget types exist before fetching full schemas or building compositions.

Values in the returned V4 schemas are plain JSON. Send settings in `build-composition.element_config` and `manage-elements.settings` using this shape directly. For allowlisted V3 widgets, send raw control keys as plain settings (no schema validation).
