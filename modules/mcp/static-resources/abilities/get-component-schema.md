Returns the schema for a specific component: its overridable props and their value shapes.

Each entry in `overridable_props` maps an `override_key` to:
- `label`: human-readable name (e.g. "Heading Title", "CTA URL") — use this to understand what value to pass
- `group_id`: optional grouping for display
- `origin_prop_schema`: JSON Schema for the `override_value` PropValue envelope to send in `element_config`

Use `origin_prop_schema` to understand the `$$type` and `value` structure required for each override.

# PLACING A COMPONENT IN build-composition

1. Use `<e-component configuration-id="my-hero">` in `xml_structure` (leaf tag — no children allowed).
2. Under `element_config`, map the configuration-id to an object with `component_id` and `overrides`:

```json
{
  "my-hero": {
    "component_id": 42,
    "overrides": {
      "title": { "$$type": "string", "value": "Welcome" },
      "cta_url": { "$$type": "url", "value": "https://example.com" }
    }
  }
}
```

Only include `override_key`s that appear in `overridable_props`. Unknown keys are rejected.
Omit `overrides` entirely if you have no overrides to apply.
Do NOT place `<e-component>` tags inside archived components.
