# MCP: `settings_variants` for per-breakpoint settings

Implemented as part of ED-25538 (not a follow-up).

Per-breakpoint **settings** live in element `settings_variants[]` (`meta.breakpoint` + `props`), matching styles. Desktop stays in `settings`. MCP uses a reserved key on the **plain settings map**.

## Contract

```json
{
  "slides_per_view": 3,
  "settings_variants": [
    { "breakpoint": "tablet", "props": { "slides_per_view": 2 } }
  ]
}
```

- Inner `$$type` stays `number` / `string` / … — agents send plain JSON.
- `get-widget-schema` sets `x-responsive: true` on opted-in props and lists `settings_variants` under `properties`.
- `get-page-structure` with `include_content` nests the same array inside `settings.settings_variants`.
- `manage-elements.update.settings` and `build-composition.element_config` peel `settings_variants`, validate breakpoints via `Responsive_Settings`, and merge props with `Plain_Values_Resolver`.
- `[]` clears all overrides. A prop set to `null` removes that override. `desktop` is rejected (belongs in `settings`).
- Unknown / non-responsive keys are skipped with a warning.

Do not reintroduce v3 `_tablet` suffixes or `$$type: responsive` envelopes.

Former ticket [ED-25548](https://elementor.atlassian.net/browse/ED-25548) was folded into this work.
