Returns the JSON Schema for each widget type's settings, including default values and nesting guidance. Pass `widget_type` as an array of every type you need.

Use `elementor/list-widget-schemas` with `summary=true` first to discover promoted widget types for new work. Types omitted from that list may still be valid here when you pass `widget_type` explicitly (for example `e-flexbox` on an existing page from `elementor/get-page-structure`). Unknown types fail with `elementor_not_found`; legacy V3 widgets without a schema fail with `elementor_v3_not_supported`.

Values in the returned schema are plain JSON. Send settings in `build-composition.element_config` and `manage-elements.settings` using this shape directly (scalars as scalars, dynamic tags as `{ name, settings }`). Only keys listed under `properties` are accepted; put all visual styling in the `style` (CSS) input.

V3 widget schemas have `widget_version` 3. Those with `style_targets` are styled per style target in the same `style` input: bare declarations and `&:state { }` style `default_style_target`; every other target is a block named by its alias, such as `dropdown { }` or `pointer:hover { }`, using only the `states` and `properties` that target lists. Blocks cannot be nested, `@media(--<breakpoint>) { }` wraps target blocks, and any other selector is dropped.
