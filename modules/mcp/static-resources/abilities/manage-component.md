Create and manage Elementor components — user-facing reusable compositions of widgets, placed elsewhere via `<e-component>` in `elementor/build-composition` (see `elementor/list-components`).

Requires administrator access. `create`, `rename`, and `archive` additionally require an active Elementor Pro license; `publish` and `update` also work with an expired license. Without the required license, calls fail with `insufficient_permissions`.

# COMPONENT INTENT
An Elementor component is a persistent, reusable widget composition. It is not a global CSS class and is not merely a group of raw widgets placed on one page.

Treat "create/build components", "with components", "basic components", and "component library/design system" as requests to create missing Elementor components. When a request separately names variables, classes, and components, all three are distinct deliverables.

Before creating a component, call `elementor/list-components` and reuse a matching component when its exposed properties cover the requested customization. If component creation fails, report the failure instead of substituting a global class and claiming that it is a component.

# ACTIONS
Every call takes one `action`: `create`, `update`, `rename`, `archive`, `publish`.

## create
Requires `title` (2-200 chars). Choose ONE source for the initial content, or omit both to create an empty component:
- **xml_structure**: same tag language as `elementor/build-composition` (`element_config`, `classes`, `style`, `interactions`). It must contain exactly one root element, and every element needs a unique `configuration-id`.
- **source_post_id** + **element_id**: copy an existing element (and its children) from another document — get `element_id` from `elementor/get-page-structure`. All ids are regenerated on the copy.

Returns `component_id`, `uid`, `editor_url`.

`xml_structure` may contain self-closing `<e-component configuration-id="…"/>` nodes to instance other components (leaf tag; no children inside `<e-component>`). `configuration-id` identifies the instance within the request; configure the reusable component it references via `element_config` using the flat `{ component_id, overrides? }` shape documented in `build-composition.md` COMPONENTS section.

```json
{
  "action": "create",
  "title": "Two Cards",
  "xml_structure": "<e-flexbox configuration-id=\"row\"><e-component configuration-id=\"card-a\"/><e-component configuration-id=\"card-b\"/></e-flexbox>",
  "element_config": {
    "card-a": { "component_id": 42, "overrides": { "title": "First Card", "image": { "src": { "url": "https://example.com/a.jpg" }, "size": "full" } } },
    "card-b": { "component_id": 42, "overrides": { "title": "Second Card", "image": { "src": { "url": "https://example.com/b.jpg" }, "size": "full" } } }
  }
}
```

Prefer instancing an existing component over inlining its widgets. If a matching component exists (check via `elementor/list-components`), place `<e-component>` instead of duplicating the subtree.
## update
Requires `component_id` and `xml_structure`. Replaces the ENTIRE component tree (same params as `create`'s xml_structure path). Not a merge — re-send the full composition.

## rename
Requires `component_id` and `title` (2-200 chars).

## archive
Requires `component_ids` (array). Archived components stop being listed by `elementor/list-components` and can no longer be placed in compositions. Returns `success_ids` / `failed_ids` per id.

## publish
Requires `component_id`. Promotes a pending draft/autosave (created via `publish_status: "draft"`) to the live version.

# publish_status
Applies to `create`, `update`, `rename`, `archive`. Defaults to `"publish"` (operates on the live document immediately). Pass `"draft"` to stage changes in an autosave that does NOT affect pages already using this component until you call `action: "publish"`.


# FURTHER INSTRUCTIONS
Every successful response includes `editor_url` and `llm_instructions` — components have no public permalink, so you MUST share `editor_url` with the user to review the change.
