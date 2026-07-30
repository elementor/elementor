Create and manage Elementor components — user-facing reusable compositions of widgets, placed elsewhere via `<e-component>` in `elementor/build-composition` (see `elementor/list-components`).

Requires administrator access. `create`, `rename`, and `archive` additionally require an active Elementor Pro license; `publish` and `update` also work with an expired license. Without the required license, calls fail with `insufficient_permissions`.

# ACTIONS
Every call takes one `action`: `create`, `update`, `rename`, `archive`, `publish`.

## create
Requires `title` (2-200 chars). Choose ONE source for the initial content, or omit both to create an empty component:
- **xml_structure**: same tag language as `elementor/build-composition` (`element_config`, `classes`, `style`). Every element needs a unique `configuration-id`.
- **source_post_id** + **element_id**: copy an existing element (and its children) from another document — get `element_id` from `elementor/get-page-structure`. All ids are regenerated on the copy.

Optionally attach `overridable_props` (see below). Returns `component_id`, `uid`, `editor_url`.

## update
Requires `component_id`. Two modes:
- **With `xml_structure`**: replaces the ENTIRE component tree (same params as `create`'s xml_structure path). Not a merge — re-send the full composition.
- **Without `xml_structure`**: requires `overridable_props`; only overridable-props metadata changes, the element tree is untouched.

## rename
Requires `component_id` and `title` (2-200 chars).

## archive
Requires `component_ids` (array). Archived components must not be placed in new compositions (`elementor/list-components` reports `is_archived: true`). Returns `success_ids` / `failed_ids` per id.

## publish
Requires `component_id`. Promotes a pending draft/autosave (created via `publish_status: "draft"`) to the live version.

# publish_status
Applies to `create`, `update`, `rename`, `archive`. Defaults to `"publish"` (operates on the live document immediately). Pass `"draft"` to stage changes in an autosave that does NOT affect pages already using this component until you call `action: "publish"`.

# overridable_props
Exposes per-instance customization points, surfaced later via `elementor/list-components`' `overridable_props` and set via `<e-component>` `element_config.overrides` in `elementor/build-composition`.

Record mapping a caller-chosen override key → `{ target, prop_key, label, group? }`:
- `target`: which element to expose a prop from.
  - With `xml_structure` (create or update): the `configuration-id` you set on that element.
  - With `source_post_id`/`element_id` (create), or `update` without `xml_structure`: the real element id (from `elementor/get-page-structure`).
- `prop_key`: the setting name on that element (from `elementor/get-widget-schema`).
- `label`: human-readable name shown to whoever configures an instance.
- `group` (optional): label used to group related overrides together; defaults to "Default".

The current/default value of `prop_key` becomes the override's origin value automatically — do NOT try to set it yourself.

```json
{
  "action": "create",
  "title": "Hero Section",
  "xml_structure": "<e-flexbox configuration-id=\"hero\"><e-heading configuration-id=\"hero-title\"></e-heading></e-flexbox>",
  "element_config": {
    "hero-title": { "title": { "content": "Welcome", "children": [] } }
  },
  "overridable_props": {
    "heading-text": {
      "target": "hero-title",
      "prop_key": "title",
      "label": "Heading Text"
    }
  }
}
```

# FURTHER INSTRUCTIONS
Every successful response includes `editor_url` and `llm_instructions` — components have no public permalink, so you MUST share `editor_url` with the user to review the change.
