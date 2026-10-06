Returns the components available on this site. Each component is a user-defined reusable composition of widgets stored as a post, embeddable in any document via the `<e-component>` XML tag in `elementor/build-composition`.

Every successful response includes `capabilities` for the current user and license tier:
- `can_create`: new components may be created.
- `can_edit`: existing components may be updated.
- `can_add_to_page`: components may be placed in page compositions.

Call in two steps, the same way `elementor/list-widget-schemas` works:

1. **Discovery** — call with no arguments to list every component without its schema. Returns `id`, `name`, `uid` per component. Archived components are never listed.
2. **Schemas** — call again with `component_ids` set to the id(s) you actually intend to place (batch them in one call) to get each component's `overridable_props`.

Always discover first. Requesting schemas for every component is wasteful on sites with many components.

- `id`: numeric post ID used to reference the component
- `name`: the human-readable title the user gave the component
- `uid`: stable string identifier
- `is_archived`: only returned for components requested via `component_ids` — an archived component cannot be placed, so pick another one
- `overridable_props`: only returned for components requested via `component_ids`

If any requested id is not a component, the call fails with `elementor_not_found` — no partial results.

Each entry in `overridable_props` maps an `override_key` to:
- `label`: human-readable name (e.g. "Heading Title", "CTA URL") — use this to understand what value to pass
- `group_id`: optional grouping for display
- `origin_prop_schema`: plain-value JSON Schema for the override value (no `$$type` envelopes — same convention as `elementor/get-widget-schema`)

Place components via `elementor/build-composition` (see its COMPONENTS section). Update an existing instance's overrides via `elementor/manage-elements` with `settings.overrides` — a deep-merge, and `null` clears a key.
