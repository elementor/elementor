Returns the full schemas for the specified components: their overridable props and the value shape for each override.

Pass a list of component `id`s (from `elementor/list-components`) via `component_ids`. Even when inspecting a single component, pass it as a one-item array. If any id is not a component, the call fails with `elementor_not_found` — no partial results.

The response is `{ "components": [ { id, name, uid, is_archived, overridable_props }, ... ] }`, mirroring `elementor/list-components` and adding `overridable_props`.

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
