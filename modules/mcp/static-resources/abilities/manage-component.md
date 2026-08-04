Create and manage Elementor components — user-facing reusable compositions of widgets, placed elsewhere via `<e-component>` in `elementor/build-composition` (see `elementor/list-components`).

Requires administrator access. `create`, `rename`, and `archive` additionally require an active Elementor Pro license; `publish` and `update` also work with an expired license. Without the required license, calls fail with `insufficient_permissions`.

# ACTIONS
Every call takes one `action`: `create`, `update`, `rename`, `archive`, `publish`.

## create
Requires `title` (2-200 chars). Choose ONE source for the initial content, or omit both to create an empty component:
- **xml_structure**: same tag language as `elementor/build-composition` (`element_config`, `classes`, `style`, `interactions`). It must contain exactly one root element, and every element needs a unique `configuration-id`.
- **source_post_id** + **element_id**: copy an existing element (and its children) from another document — get `element_id` from `elementor/get-page-structure`. All ids are regenerated on the copy.

Optionally attach `overridable_props` (see below). Returns `component_id`, `uid`, `editor_url`.

`xml_structure` may contain `<e-component configuration-id="…"></e-component>` nodes to instance other components (leaf tag; no children inside `<e-component>`). `configuration-id` identifies the instance within the request; configure the reusable component it references via `element_config` using the flat `{ component_id, overrides? }` shape documented in `build-composition.md` COMPONENTS section.

```json
{
  "action": "create",
  "title": "Two Cards",
  "xml_structure": "<e-flexbox configuration-id=\"row\"><e-component configuration-id=\"card-a\"></e-component><e-component configuration-id=\"card-b\"></e-component></e-flexbox>",
  "element_config": {
    "card-a": { "component_id": 42, "overrides": { "title": "First Card", "image": { "src": { "url": "https://example.com/a.jpg" }, "size": "full" } } },
    "card-b": { "component_id": 42, "overrides": { "title": "Second Card", "image": { "src": { "url": "https://example.com/b.jpg" }, "size": "full" } } }
  }
}
```

Prefer instancing an existing component over inlining its widgets. If a matching component exists (check via `elementor/list-components`), place `<e-component>` instead of duplicating the subtree.
## update
Requires `component_id`. Two modes:
- **With `xml_structure`**: replaces the ENTIRE component tree (same params as `create`'s xml_structure path). Not a merge — re-send the full composition.
- **Without `xml_structure`**: requires `overridable_props`; only overridable-props metadata changes, the element tree is untouched.

## rename
Requires `component_id` and `title` (2-200 chars).

## archive
Requires `component_ids` (array). Archived components stop being listed by `elementor/list-components` and can no longer be placed in compositions. Returns `success_ids` / `failed_ids` per id.

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
- `prop_key`: identifies WHICH setting to expose. Meaning depends on the target:
  - Raw widget / atomic element (`<e-heading>`, `<e-image>`, `<e-flexbox>`, etc.): the setting name on that element (from `elementor/get-widget-schema`).
  - Nested `<e-component>` instance (expose-further): the inner component's own exposed override key (from `elementor/list-components` `overridable_props` for that component). The inner component must already expose the prop before you can re-expose it through the wrapper.
- `label`: human-readable name shown to whoever configures an instance.
- `group` (optional): label used to group related overrides together; defaults to "Default".

The current/default value of `prop_key` becomes the override's origin value automatically — do NOT try to set it yourself.

Expose-further composes through any depth: if the inner component's exposed key was itself exposed from a grand-child, the wrapper's control still resolves to the underlying raw widget's schema.

Example — a `Cards Grid` wrapper that re-exposes `caption`/`image` from each nested `<e-component>` instance of a `Card` component (which itself exposes `caption` from an `<e-paragraph>` and `image` from an `<e-image>`):

```json
{
  "action": "create",
  "title": "Cards Grid",
  "xml_structure": "<e-flexbox configuration-id=\"grid\"><e-component configuration-id=\"card-1\"></e-component><e-component configuration-id=\"card-2\"></e-component></e-flexbox>",
  "element_config": {
    "card-1": { "component_id": 42 },
    "card-2": { "component_id": 42 }
  },
  "overridable_props": {
    "card_1_caption": { "target": "card-1", "prop_key": "caption", "label": "Card 1 Caption", "group": "Card 1" },
    "card_1_image":   { "target": "card-1", "prop_key": "image",   "label": "Card 1 Image",   "group": "Card 1" },
    "card_2_caption": { "target": "card-2", "prop_key": "caption", "label": "Card 2 Caption", "group": "Card 2" },
    "card_2_image":   { "target": "card-2", "prop_key": "image",   "label": "Card 2 Image",   "group": "Card 2" }
  }
}
```

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
