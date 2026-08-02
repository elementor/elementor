Returns the components available on this site. Each component is a user-defined reusable composition of widgets stored as a post, embeddable in any document via the `<e-component>` XML tag in `elementor/build-composition`.

Call in two steps, the same way `elementor/list-widget-schemas` works:

1. **Discovery** — call with no arguments to list every component without its schema. Returns `id`, `name`, `uid`, `is_archived` per component.
2. **Schemas** — call again with `component_ids` set to the id(s) you actually intend to place (batch them in one call) to get each component's `overridable_props`.

Always discover first. Requesting schemas for every component is wasteful on sites with many components.

- `id`: numeric post ID used to reference the component
- `name`: the human-readable title the user gave the component
- `uid`: stable string identifier
- `is_archived`: archived components should not be placed in new compositions
- `overridable_props`: only returned for components requested via `component_ids`

If any requested id is not a component, the call fails with `elementor_not_found` — no partial results.

Each entry in `overridable_props` maps an `override_key` to:
- `label`: human-readable name (e.g. "Heading Title", "CTA URL") — use this to understand what value to pass
- `group_id`: optional grouping for display
- `origin_prop_schema`: plain-value JSON Schema for the override value (no `$$type` envelopes — same convention as `elementor/get-widget-schema`)

# PLACING A COMPONENT IN build-composition

1. Use `<e-component configuration-id="my-hero">` in `xml_structure` (leaf tag — no children allowed).
2. Under `element_config`, map the configuration-id to `{ component_id, overrides? }`. Send each override value in the plain-value shape described by `origin_prop_schema`:

```json
{
  "element_config": {
    "my-hero": {
      "component_id": 42,
      "overrides": {
        "title": "Welcome",
        "cta_url": "https://example.com"
      }
    }
  }
}
```

Only include `override_key`s that appear in `overridable_props`. Unknown keys are rejected.
Omit `overrides` entirely if you have no overrides to apply.
Do NOT place `<e-component>` tags inside archived components.

# UPDATING AN EXISTING COMPONENT INSTANCE via manage-elements

Use `elementor/manage-elements` with `action=update` and `settings={ component_id?, overrides }`. Semantics:

- `component_id` is optional — inferred from the existing instance if omitted.
- Each `override_key` in `overrides` is deep-merged onto the existing overrides: only mentioned keys change.
- Pass `null` for an `override_key` to remove that override (revert to component default).
- Override keys not mentioned in the payload are preserved untouched — you do NOT need to re-send unchanged overrides.

Example — change only the CTA URL and clear the title override:

```json
{
  "post_id": 41870,
  "operations": [
    {
      "action": "update",
      "element_id": "1d367385",
      "settings": {
        "overrides": {
          "cta_url": "https://new.example.com",
          "title": null
        }
      }
    }
  ]
}
```
